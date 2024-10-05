import express from "express";
import cors from "cors";
import bodyParser from 'body-parser';
import { PORT } from "./src/config.js";
import reservesRoutes from "./src/routes/reserves.routes.js";

const app = express();
const allowedOrigins = ['http://localhost:3000', 'https://cuarto-detonao.vercel.app'];

app.use(cors());

// O bien, para limitarlo solo a tu origen (front-end)
app.use(cors({
    origin: (origin, callback) => {
        // Permitir solicitudes sin origen (como desde herramientas locales o servidores)
        if (!origin) return callback(null, true);
        
        // Verificar si el origen está en la lista permitida
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'El CORS no permite acceso desde este origen.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true, // Si necesitas compartir cookies o cabeceras de autenticación
}));

app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));
app.use(express.json());
app.use(reservesRoutes)

app.listen(PORT)
console.log("Server started on port", PORT);