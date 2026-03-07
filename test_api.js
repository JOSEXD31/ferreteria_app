
async function testVenta() {
    const payload = {
        detalles: [
            {
                id_producto: 1,
                cantidad: 1,
                precio_unitario: 10,
                subtotal: 10,
                descripcion: "Producto de prueba",
                unidad: "Und",
                factor: 1
            }
        ],
        total: 10,
        igv: 1.5,
        subtotal: 8.5,
        id_usuario: 1,
        id_cliente: null,
        tipo: "producto",
        metodo_pago: "Efectivo", // Capitalized! This should fail Zod
        tipo_comprobante: "ticket",
        monto_efectivo: 10,
        monto_transferencia: 0
    };

    console.log("Testing with payload:", JSON.stringify(payload, null, 2));

    try {
        const response = await fetch("http://localhost:3000/api/ventas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Assuming session is handled via cookies, but we might need a test session
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

testVenta();
