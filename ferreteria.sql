CREATE DATABASE IF NOT EXISTS ferreteria_system;
USE ferreteria_system;

SET FOREIGN_KEY_CHECKS=0;

-- ===============================
-- 1. USUARIOS
-- ===============================
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin','vendedor','almacen','tecnico') NOT NULL,
    estado TINYINT DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===============================
-- 2. CATEGORIAS
-- ===============================
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado TINYINT DEFAULT 1
) ENGINE=InnoDB;

-- ===============================
-- 3. UNIDADES DE MEDIDA
-- ===============================
CREATE TABLE unidades_medida (
    id_unidad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    abreviatura VARCHAR(10) NOT NULL
) ENGINE=InnoDB;

-- ===============================
-- 4. PRODUCTOS
-- ===============================
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    id_categoria INT,
    id_unidad INT,
    precio_compra DECIMAL(10,2) DEFAULT 0,
    precio_venta DECIMAL(10,2) NOT NULL,
    stock_actual DECIMAL(12,2) DEFAULT 0,
    stock_minimo DECIMAL(12,2) DEFAULT 0,
    estado TINYINT DEFAULT 1,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (id_categoria),
    INDEX (id_unidad),
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    FOREIGN KEY (id_unidad) REFERENCES unidades_medida(id_unidad)
) ENGINE=InnoDB;

-- ===============================
-- 5. MOVIMIENTOS INVENTARIO (KARDEX)
-- ===============================
CREATE TABLE movimientos_inventario (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    tipo ENUM('compra','venta','ajuste','uso_trabajo') NOT NULL,
    cantidad DECIMAL(12,2) NOT NULL,
    precio_unitario DECIMAL(10,2),
    referencia VARCHAR(100),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (id_producto),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB;

-- ===============================
-- 6. PROVEEDORES
-- ===============================
CREATE TABLE proveedores (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    ruc VARCHAR(20),
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    email VARCHAR(100),
    estado TINYINT DEFAULT 1
) ENGINE=InnoDB;

-- ===============================
-- 7. COMPRAS
-- ===============================
CREATE TABLE compras (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor INT NOT NULL,
    id_usuario INT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(12,2),
    igv DECIMAL(12,2),
    total DECIMAL(12,2),
    INDEX (id_proveedor),
    INDEX (id_usuario),
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- ===============================
-- 8. DETALLE COMPRAS
-- ===============================
CREATE TABLE detalle_compras (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad DECIMAL(12,2) NOT NULL,
    precio_compra DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2),
    INDEX (id_compra),
    INDEX (id_producto),
    FOREIGN KEY (id_compra) REFERENCES compras(id_compra) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB;

-- ===============================
-- 9. CLIENTES
-- ===============================
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    dni_ruc VARCHAR(20),
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    estado TINYINT DEFAULT 1
) ENGINE=InnoDB;

-- ===============================
-- 10. VENTAS
-- ===============================
CREATE TABLE ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT,
    id_usuario INT,
    tipo ENUM('producto','trabajo') DEFAULT 'producto',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(12,2),
    igv DECIMAL(12,2),
    total DECIMAL(12,2),
    estado ENUM('pagado','anulado') DEFAULT 'pagado',
    INDEX (id_cliente),
    INDEX (id_usuario),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- ===============================
-- 11. DETALLE VENTAS
-- ===============================
CREATE TABLE detalle_ventas (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT,
    descripcion VARCHAR(200),
    cantidad DECIMAL(12,2),
    precio_unitario DECIMAL(10,2),
    subtotal DECIMAL(12,2),
    INDEX (id_venta),
    INDEX (id_producto),
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB;

-- ===============================
-- 12. CAJA
-- ===============================
CREATE TABLE caja (
    id_caja INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    monto_inicial DECIMAL(12,2),
    total_ingresos DECIMAL(12,2),
    total_egresos DECIMAL(12,2),
    monto_final DECIMAL(12,2),
    id_usuario INT,
    INDEX (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- ===============================
-- 13. TRABAJOS (ESCALABLE)
-- ===============================
CREATE TABLE trabajos (
    id_trabajo INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    costo_materiales DECIMAL(12,2),
    costo_mano_obra DECIMAL(12,2),
    precio_total DECIMAL(12,2),
    estado ENUM('pendiente','proceso','terminado'),
    INDEX (id_cliente),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
) ENGINE=InnoDB;

-- ===============================
-- 14. TRABAJO MATERIALES
-- ===============================
CREATE TABLE trabajo_materiales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_trabajo INT,
    id_producto INT,
    cantidad DECIMAL(12,2),
    INDEX (id_trabajo),
    INDEX (id_producto),
    FOREIGN KEY (id_trabajo) REFERENCES trabajos(id_trabajo) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB;

-- ===============================
-- 15. TECNICOS
-- ===============================
CREATE TABLE tecnicos (
    id_tecnico INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150),
    telefono VARCHAR(20),
    especialidad VARCHAR(100),
    estado TINYINT DEFAULT 1
) ENGINE=InnoDB;

-- ===============================
-- 16. TRABAJO TECNICOS
-- ===============================
CREATE TABLE trabajo_tecnicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_trabajo INT,
    id_tecnico INT,
    pago DECIMAL(12,2),
    INDEX (id_trabajo),
    INDEX (id_tecnico),
    FOREIGN KEY (id_trabajo) REFERENCES trabajos(id_trabajo) ON DELETE CASCADE,
    FOREIGN KEY (id_tecnico) REFERENCES tecnicos(id_tecnico)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS=1;


DELIMITER $$

CREATE TRIGGER trg_compra_insert
AFTER INSERT ON detalle_compras
FOR EACH ROW
BEGIN
    -- Aumentar stock
    UPDATE productos 
    SET stock_actual = stock_actual + NEW.cantidad
    WHERE id_producto = NEW.id_producto;

    -- Registrar movimiento
    INSERT INTO movimientos_inventario 
    (id_producto, tipo, cantidad, precio_unitario, referencia)
    VALUES 
    (NEW.id_producto, 'compra', NEW.cantidad, NEW.precio_compra, CONCAT('Compra ID: ', NEW.id_compra));
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_compra_delete
AFTER DELETE ON detalle_compras
FOR EACH ROW
BEGIN
    UPDATE productos 
    SET stock_actual = stock_actual - OLD.cantidad
    WHERE id_producto = OLD.id_producto;

    INSERT INTO movimientos_inventario 
    (id_producto, tipo, cantidad, referencia)
    VALUES 
    (OLD.id_producto, 'ajuste', -OLD.cantidad, CONCAT('Eliminación Compra ID: ', OLD.id_compra));
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_venta_insert
AFTER INSERT ON detalle_ventas
FOR EACH ROW
BEGIN
    UPDATE productos 
    SET stock_actual = stock_actual - NEW.cantidad
    WHERE id_producto = NEW.id_producto;

    INSERT INTO movimientos_inventario 
    (id_producto, tipo, cantidad, precio_unitario, referencia)
    VALUES 
    (NEW.id_producto, 'venta', -NEW.cantidad, NEW.precio_unitario, CONCAT('Venta ID: ', NEW.id_venta));
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_venta_update
AFTER UPDATE ON detalle_ventas
FOR EACH ROW
BEGIN
    DECLARE diferencia DECIMAL(12,2);

    SET diferencia = OLD.cantidad - NEW.cantidad;

    UPDATE productos
    SET stock_actual = stock_actual + diferencia
    WHERE id_producto = NEW.id_producto;

    INSERT INTO movimientos_inventario
    (id_producto, tipo, cantidad, referencia)
    VALUES
    (NEW.id_producto, 'ajuste', diferencia, CONCAT('Modificación Venta ID: ', NEW.id_venta));
END$$

DELIMITER ;


DELIMITER $$

CREATE TRIGGER trg_trabajo_material_insert
AFTER INSERT ON trabajo_materiales
FOR EACH ROW
BEGIN
    UPDATE productos
    SET stock_actual = stock_actual - NEW.cantidad
    WHERE id_producto = NEW.id_producto;

    INSERT INTO movimientos_inventario
    (id_producto, tipo, cantidad, referencia)
    VALUES
    (NEW.id_producto, 'uso_trabajo', -NEW.cantidad, CONCAT('Trabajo ID: ', NEW.id_trabajo));
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_trabajo_material_delete
AFTER DELETE ON trabajo_materiales
FOR EACH ROW
BEGIN
    UPDATE productos
    SET stock_actual = stock_actual + OLD.cantidad
    WHERE id_producto = OLD.id_producto;

    INSERT INTO movimientos_inventario
    (id_producto, tipo, cantidad, referencia)
    VALUES
    (OLD.id_producto, 'ajuste', OLD.cantidad, CONCAT('Eliminación Trabajo ID: ', OLD.id_trabajo));
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_anular_venta
AFTER UPDATE ON ventas
FOR EACH ROW
BEGIN
    IF OLD.estado = 'pagado' AND NEW.estado = 'anulado' THEN
        
        UPDATE productos p
        JOIN detalle_ventas dv ON p.id_producto = dv.id_producto
        SET p.stock_actual = p.stock_actual + dv.cantidad
        WHERE dv.id_venta = NEW.id_venta;

        INSERT INTO movimientos_inventario (id_producto, tipo, cantidad, referencia)
        SELECT id_producto, 'ajuste', cantidad, CONCAT('Anulación Venta ID: ', NEW.id_venta)
        FROM detalle_ventas
        WHERE id_venta = NEW.id_venta;

    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_prevent_negative_stock
BEFORE UPDATE ON productos
FOR EACH ROW
BEGIN
    IF NEW.stock_actual < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente para realizar la operación';
    END IF;
END$$

DELIMITER ;