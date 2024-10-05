import express from "express";
import cors from "cors";
import bodyParser from 'body-parser';
import { PORT } from "./src/config.js";
import reservesRoutes from "./src/routes/reserves.routes.js";

const app = express();
const allowedOrigins = ['http://localhost:3000', 'https://cuarto-detonao-backend.onrender.com'];

app.use(cors());

// O bien, para limitarlo solo a tu origen (front-end)
app.use(cors({
    origin: 'https://cuarto-detonao.vercel.app/'  // Cambia esto por la URL de tu front-end
}));

app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));
app.use(express.json());
app.use(reservesRoutes)

app.listen(PORT)
console.log("Server started on port", PORT);