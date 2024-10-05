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
    origin: function (origin, callback) {
        // Permitir solicitudes sin origen (como aplicaciones móviles o curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));
app.use(express.json());
app.use(reservesRoutes)

app.listen(PORT)
console.log("Server started on port", PORT);