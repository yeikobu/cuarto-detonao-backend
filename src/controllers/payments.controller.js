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
        const paymentsResponse = await pool.query("SELECT * FROM pagos");
        const payments = paymentsResponse.rows;

        if(payments.length === 0) {
            return res.status(404).send("No hay pagos disponibles");
        }
        
        res.json(payments);
    } catch (error) {
        console.error("Error al obtener todos los pagos:", error);
        res.status(500).send("Error al obtener todos los pagos");
    }
}