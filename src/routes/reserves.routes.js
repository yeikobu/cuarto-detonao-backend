import { Router } from "express";
import { pool } from "../db.js";
import { sayHello,getAllReserves, getReserveById, createReserve, deleteReserveById, updateReserveById } from "../controllers/reserves.controller.js";

const router = Router();

router.get("/", sayHello);

// Obtener todas las reservas junto con sus detalles, sin incluir el "reserva_id" en los detalles
router.get("/reserves", getAllReserves);


// Obtener una reserva por su id, junto con sus detalles
router.get("/reserve/:id", getReserveById);


// Crear una nueva reserva con sus detalles
router.post("/reserve", createReserve);


// Eliminar una reserva por su id junto con sus detalles
router.delete("/reserve/:id", deleteReserveById);


// Actualizar una reserva por su id junto con sus detalles
router.put("/reserve/:id", updateReserveById);

export default router;