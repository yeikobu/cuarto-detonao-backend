import { pool } from "../db.js";

export const sayHello = async (req, res) => {
    try {
        res.send("Hello World!");
    }catch (error) {
        console.error("Error al enviar mensaje de hola mundo:", error);
        res.status(500).send("Error al enviar mensaje de hola mundo");
    }
}

// Obtener todas las reservas con sus detalles
export const getAllReserves =  async (req, res) => {
    try {
        // Obtener todas las reservas incluyendo la foto
        const reservasResponse = await pool.query("SELECT * FROM reservas");
        const reservas = reservasResponse.rows;

        if (reservas.length === 0) {
            return res.status(404).send("No hay reservas disponibles");
        }

        // Obtener todos los detalles de todas las reservas
        const detallesResponse = await pool.query("SELECT color_nombre, cantidad, reserva_id FROM detalles_reserva");
        const detalles = detallesResponse.rows;

        // Combinar cada reserva con sus detalles correspondientes
        const reservasConDetalles = reservas.map(reserva => {
            // Filtrar los detalles que correspondan a esta reserva por el reserva_id
            const detallesDeReserva = detalles
                .filter(detalle => detalle.reserva_id === reserva.id)
                .map(({ color_nombre, cantidad }) => ({ color_nombre, cantidad })); // Excluir reserva_id

            return {
                ...reserva,
                detalles: detallesDeReserva
            };
        });

        // Enviar las reservas con sus detalles, incluyendo la foto
        res.json(reservasConDetalles);

    } catch (error) {
        console.error("Error al obtener todas las reservas:", error);
        res.status(500).send("Error al obtener todas las reservas");
    }
};


// Obtener una reserva por su id, junto con sus detalles
export const getReserveById = async (req, res) => {
    const { id } = req.params;

    try {
        // Consulta para obtener los datos de la reserva, incluyendo la foto
        const reserveResponse = await pool.query("SELECT * FROM reservas WHERE id = $1", [id]);

        if (reserveResponse.rows.length === 0) {
            return res.status(404).send("Reserva no encontrada");
        }

        const reserva = reserveResponse.rows[0];

        // Consulta para obtener los detalles de la reserva (colores y cantidades)
        const detallesResponse = await pool.query(
            `SELECT d.color_nombre, d.cantidad 
             FROM detalles_reserva d 
             WHERE d.reserva_id = $1`, [id]
        );

        const detalles = detallesResponse.rows;

        // Devolver tanto la información de la reserva como los detalles en la respuesta
        res.json({
            reserva,
            detalles
        });

    } catch (error) {
        console.error("Error al obtener la reserva y sus detalles:", error);
        res.status(500).send("Error al obtener la reserva y sus detalles");
    }
};


// Crear una nueva reserva
export const createReserve = async (req, res) => {
    const client = await pool.connect();

    // Obtenemos los datos de req.body, incluyendo el campo 'foto' y el array 'detalles'
    const { remitente_nombre, remitente_apellido, remitente_pseudonimo, remitente_curso, remitente_anonimo, destinatario_nombre, destinatario_apellido, destinatario_pseudonimo, destinatario_curso, total_a_pagar, dedicatoria, foto_url, detalles } = req.body;

    try {
        // Iniciar la transacción
        await client.query('BEGIN');
        
        // Inserción de la reserva principal en la tabla 'reservas', incluyendo el campo 'foto'
        const reservaResponse = await client.query(
            `INSERT INTO reservas 
                (remitente_nombre, remitente_apellido, remitente_pseudonimo, remitente_curso, remitente_anonimo, 
                destinatario_nombre, destinatario_apellido, destinatario_pseudonimo, destinatario_curso, total_a_pagar, dedicatoria, foto_url) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
            RETURNING id`, 
            [
                remitente_nombre,
                remitente_apellido,
                remitente_pseudonimo,
                remitente_curso,
                remitente_anonimo,
                destinatario_nombre,
                destinatario_apellido,
                destinatario_pseudonimo,
                destinatario_curso,
                total_a_pagar,
                dedicatoria,
                foto_url
            ]
        );

        const reservaId = reservaResponse.rows[0].id;

        // Inserción de los detalles de la reserva
        for (const detalle of detalles) {
            const { color_nombre, cantidad } = detalle;
            await client.query(
                `INSERT INTO detalles_reserva (reserva_id, color_nombre, cantidad) 
                VALUES ($1, $2, $3)`, 
                [reservaId, color_nombre, cantidad]
            );
        }

        // Confirmar la transacción
        await client.query('COMMIT');
        res.status(201).send({ message: "Reserva y detalles creados exitosamente", numero_reserva: reservaId });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al crear la reserva y sus detalles:", error);
        res.status(500).send("Error al crear la reserva y sus detalles");
    } finally {
        client.release();
    }
};


//Eliminar una reserva por su id junto con sus detalles
export const deleteReserveById =  async (req, res) => {
    const { id } = req.params;

    try {
        // Iniciar una transacción para asegurar que ambas operaciones (detalles y reserva) se realicen correctamente
        await pool.query("BEGIN");

        // Primero eliminamos los detalles relacionados con la reserva
        await pool.query("DELETE FROM detalles_reserva WHERE reserva_id = $1", [id]);

        // Luego eliminamos la reserva
        const { rows, rowCount } = await pool.query("DELETE FROM reservas WHERE id = $1 RETURNING *", [id]);

        // Si no se encuentra la reserva
        if (rowCount === 0) {
            await pool.query("ROLLBACK"); // Deshacer la transacción si no se encuentra la reserva
            return res.status(404).send({ message: "Reserva no encontrada" });
        }

        // Confirmar la transacción
        await pool.query("COMMIT");

        // Enviar una respuesta de éxito
        return res.send({ message: `Reserva de ${rows[0].remitente_nombre} ${rows[0].remitente_apellido} eliminada exitosamente` });
    } catch (error) {
        // En caso de error, deshacer cualquier cambio
        await pool.query("ROLLBACK");
        console.error("Error al eliminar la reserva:", error);
        return res.status(500).send("Error al eliminar la reserva");
    }
}


// Actualizar una reserva por su id junto con sus detalles
export const updateReserveById = async (req, res) => {
    const { id } = req.params;
    const {
        remitente_nombre,
        remitente_apellido,
        remitente_pseudonimo,
        remitente_curso,
        remitente_anonimo,
        destinatario_nombre,
        destinatario_apellido,
        destinatario_pseudonimo,
        destinatario_curso,
        total_a_pagar,
        dedicatoria,
        foto_url,
        detalles // Array de objetos { color_nombre, cantidad }
    } = req.body;

    try {
        // Iniciar la transacción
        await pool.query("BEGIN");

        // Actualizar los datos de la reserva, incluyendo el campo 'foto'
        const updateReservaQuery = `
            UPDATE reservas 
            SET remitente_nombre = $1, remitente_apellido = $2, remitente_pseudonimo = $3, 
                remitente_curso = $4, remitente_anonimo = $5, destinatario_nombre = $6, 
                destinatario_apellido = $7, destinatario_pseudonimo = $8, destinatario_curso = $9, 
                total_a_pagar = $10, dedicatoria = $11, foto_url = $12
            WHERE id = $13
            RETURNING *;
        `;
        const reservaValues = [
            remitente_nombre,
            remitente_apellido,
            remitente_pseudonimo,
            remitente_curso,
            remitente_anonimo,
            destinatario_nombre,
            destinatario_apellido,
            destinatario_pseudonimo,
            destinatario_curso,
            total_a_pagar,
            dedicatoria,
            foto_url,
            id
        ];
        const { rowCount: reservaCount, rows: reservaRows } = await pool.query(updateReservaQuery, reservaValues);

        // Si la reserva no se encuentra
        if (reservaCount === 0) {
            await pool.query("ROLLBACK");
            return res.status(404).send({ message: "Reserva no encontrada" });
        }

        // Eliminar los detalles anteriores de la reserva
        await pool.query("DELETE FROM detalles_reserva WHERE reserva_id = $1", [id]);

        // Insertar los nuevos detalles de la reserva
        for (const detalle of detalles) {
            const { color_nombre, cantidad } = detalle;
            await pool.query(
                `INSERT INTO detalles_reserva (reserva_id, color_nombre, cantidad) 
                 VALUES ($1, $2, $3)`,
                [id, color_nombre, cantidad]
            );
        }

        // Confirmar la transacción
        await pool.query("COMMIT");

        // Devolver la reserva actualizada
        res.send({
            message: `Reserva con id ${id} actualizada exitosamente`,
            reserva: reservaRows[0],
            detalles
        });

    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Error al actualizar la reserva:", error);
        res.status(500).send("Error al actualizar la reserva");
    }
};
