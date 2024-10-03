import express from "express";
import { PORT } from "./config.js";
import reservesRoutes from "./routes/reserves.routes.js";

const app = express();

app.use(express.json());
app.use(reservesRoutes)

app.listen(PORT)
console.log("Server started on port", PORT);