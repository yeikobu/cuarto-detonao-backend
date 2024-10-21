import { pool } from "../db.js";

export const createPayment = async (req, res) => { 
    const client = await pool.connect();

    const { reserva_id, metodo_pago, monto, estado } = req.body;

    try { 
        await client.query('BEGIN');

        const paymentResponse = await client.query(
            `INSERT INTO pagos (reserva_id, metodo_pago, monto, estado) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id`, 
            [
                reserva_id,
                metodo_pago,
                monto,
                estado
            ]
        );

        const paymentId = paymentResponse.rows[0].id;

        await client.query('COMMIT');
        res.status(201).send( { message: "Pago creado exitosamente", payment_id: paymentId } );
    } catch (error) {
        console.error("Error al crear el pago:", error);
        res.status(500).send("Error al crear el pago");
    } finally {
        client.release();
    }
}

export const getAllPayments = async (req, res) => {    
    try {
        const reservasResponse = await pool.query(
            `SELECT * FROM reservas as r`
        );

        const reservas = reservasResponse.rows;

        if(reservas.length === 0) {
            return res.status(404).send("No hay reservas disponibles");
        }

        const pagosResponse = await pool.query(
            `SELECT * FROM pagos`
        );

        const pagos = pagosResponse.rows;

        // Crear un objeto de pagos por reserva_id en lugar de un array
        const pagosPorReserva = pagos.reduce((acc, pago) => {
            acc[pago.reserva_id] = {
                id: pago.id,
                metodo_pago: pago.metodo_pago,
                monto: pago.monto,
                estado: pago.estado,
                fecha_pago: pago.fecha_pago
            };
            return acc;
        }, {}); // Inicializamos con un objeto vacío

        // Filtrar solo las reservas que tienen un pago asociado
        const reservasConPagos = reservas
            .map(reserva => {
                return {
                    ...reserva,
                    pago: pagosPorReserva[reserva.id]
                };
            });

        const detallesResponse = await pool.query("SELECT color_nombre, cantidad, reserva_id FROM detalles_reserva");
        const detalles = detallesResponse.rows;

        const reservasPagadasConDetalles = reservasConPagos.map(reserva => {
            const detallesDeReserva = detalles
                .filter(detalle => detalle.reserva_id === reserva.id)
                .map(({ color_nombre, cantidad }) => ({ color_nombre, cantidad })); // Excluir reserva_id

            return {
                ...reserva,
                detalles: detallesDeReserva
            };
        });

        res.json(reservasPagadasConDetalles);
    } catch (error) {
        console.error("Error al obtener todos los pagos:", error);
        res.status(500).send("Error al obtener todos los pagos");
    }
}

export const updatePaymentById = async (req, res) => { 
    const { id } = req.params;
    const {
        reserva_id, 
        metodo_pago,
        monto,
        estado
    } = req.body;


    try {
        await pool.query("BEGIN");

        const updatePaymentQuery = `
            UPDATE pagos 
            SET reserva_id = $1, metodo_pago = $2, monto = $3, estado = $4
            WHERE id = $5
            RETURNING *;
        `;
        const paymentValues = [
            reserva_id,
            metodo_pago,
            monto,
            estado,
            id
        ];
        const { rowCount: paymentCount, rows: paymentRows } = await pool.query(updatePaymentQuery, paymentValues);

        if (paymentCount === 0) {
            await pool.query("ROLLBACK");
            return res.status(404).send({ message: "Pago no encontrado" });
        }

        await pool.query("COMMIT");

        res.send({
            message: `Pago con id ${id} actualizado exitosamente`,
            payment: paymentRows[0]
        });
    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Error al actualizar el pago:", error);
        res.status(500).send("Error al actualizar el pago");
    }
}

export const deletePaymentById = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query("BEGIN");

        const { rowCount: paymentCount } = await pool.query("DELETE FROM pagos WHERE id = $1 RETURNING *", [id]);

        if (paymentCount === 0) {
            await pool.query("ROLLBACK");
            return res.status(404).send({ message: "Pago no encontrado" });
        }

        await pool.query("COMMIT");

        res.send({ message: `Pago con id ${id} eliminado exitosamente` });
    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Error al eliminar el pago:", error);
        res.status(500).send("Error al eliminar el pago");
    }
}