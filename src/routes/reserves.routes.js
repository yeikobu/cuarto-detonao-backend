import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/reserves", (req, res) => {
  res.send("Obteniendo reservas");
});

router.get("/reserve/:id", (req, res) => {
    const { id } = req.params //obtiene el id de la reserva a través de los parametros de la ruta
    res.send("Obteniendo reserva con id: " + id);
});

router.post("/reserve", (req, res) => {
    res.send("Creando reserva");
});

router.delete("/reserve:id", (req, res) => {
    const { id } = req.params
    res.send("Eliminando reserva con id: " + id);
});

router.put("/reserve/:id", (req, res) => {
    const { id } = req.params
    res.send("Actualizando reserva con id: " + id);
});

export default router;