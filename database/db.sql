-- Tabla de colores de rosas (usamos el nombre del color como clave primaria)
CREATE TABLE colores (
    nombre VARCHAR(50) PRIMARY KEY -- Usamos el nombre como identificador único
);

-- Tabla de reservas con remitente y destinatario en la misma tabla
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    
    -- Datos del remitente
    remitente_nombre VARCHAR(100) NOT NULL,
    remitente_apellido VARCHAR(100) NOT NULL,
    remitente_pseudonimo VARCHAR(100),
    remitente_curso VARCHAR(100) NOT NULL,
    remitente_anonimo BOOLEAN DEFAULT FALSE,

    -- Datos del destinatario
    destinatario_nombre VARCHAR(100) NOT NULL,
    destinatario_apellido VARCHAR(100) NOT NULL,
    destinatario_pseudonimo VARCHAR(100),
    destinatario_curso VARCHAR(100) NOT NULL,

    -- Otros detalles de la reserva
    total_a_pagar INT NOT NULL, -- Calculado con base en las reglas de precios
    dedicatoria TEXT,
    foto_url VARCHAR(255), -- Para almacenar la URL de la foto
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para los detalles de la reserva (rosas, colores y cantidades)
CREATE TABLE detalles_reserva (
    reserva_id INT REFERENCES reservas(id) ON DELETE CASCADE,
    color_nombre VARCHAR(50) REFERENCES colores(nombre) ON DELETE CASCADE, -- Usamos el nombre del color como clave foránea
    cantidad INT NOT NULL CHECK (cantidad > 0), -- Cantidad de rosas de ese color
    PRIMARY KEY (reserva_id, color_nombre) -- Clave primaria compuesta
);

-- Tabla de pagos (opcional, si se integra en el futuro)
CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    reserva_id INT REFERENCES reservas(id) ON DELETE CASCADE,
    metodo_pago VARCHAR(50), -- Ejemplo: 'Efectivo', 'Tarjeta'
    monto INT NOT NULL,
    estado VARCHAR(50), -- Ejemplo: 'Pendiente', 'Pagado'
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar algunos colores de rosas en la tabla de colores
INSERT INTO colores (nombre) VALUES
('Roja'),
('Blanca'),
('Amarilla'),
('Naranja con puntas rojas'),
('Azul'),
('Morada');


-- Insertar una nueva reserva con datos de remitente y destinatario
INSERT INTO reservas (
    remitente_nombre, remitente_apellido, remitente_pseudonimo, remitente_curso, remitente_anonimo, 
    destinatario_nombre, destinatario_apellido, destinatario_pseudonimo, destinatario_curso, 
    total_a_pagar, dedicatoria
)
VALUES ('Juan', 'Pérez', 'JP', 'Cuarto Medio A', false, 'Ana', 'Gómez', 'Anita', 'Cuarto Medio B', 5000, 'Para alguien especial');

-- Insertar los colores y cantidades de las rosas asociadas a esa reserva
INSERT INTO detalles_reserva (reserva_id, color_nombre, cantidad)
VALUES 
(1, 'Roja', 3),  -- 3 rosas rojas
(1, 'Blanca', 2);  -- 2 rosas blancas



-- Consulta para obtener todos los colores y cantidades de una reserva
SELECT r.id AS reserva_id, 
       r.remitente_nombre, 
       r.destinatario_nombre, 
       d.color_nombre AS color_rosa, 
       d.cantidad 
FROM reservas r
JOIN detalles_reserva d ON r.id = d.reserva_id
WHERE r.id = 1;

