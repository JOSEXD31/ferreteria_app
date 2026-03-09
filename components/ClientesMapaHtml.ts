
interface Client {
  cli_id: string
  cli_tipo: string
  cli_nombre: string
  cli_apellido: string
  cli_razonsoci: string
  cli_dni: string
  cli_ruc: string
  cli_direccion: string
  cli_coordenada: string
  cli_cel: string
  num_con: string
  id_serv: string
  serv_nombre: string
  fecha_registro: string
  fecha_inicio: string
  estado: string
  usu_nombre: string
  id_caja: string
  id_nodo: number
}

export function generarMapaHTML(clients: Client[]) {
  const ubicaciones = clients
    .filter(c => c.cli_coordenada && c.cli_coordenada.includes(","))
    .map(c => {
      const [lat, lng] = c.cli_coordenada.split(",").map(Number);
      const nombreCompleto = c.cli_tipo === 'NATURAL'
        ? `${c.cli_nombre} ${c.cli_apellido}`
        : c.cli_razonsoci;

      const doc = c.cli_tipo === 'NATURAL'
        ? `<strong>DNI:</strong> ${c.cli_dni}`
        : `<strong>RUC:</strong> ${c.cli_ruc}`;

      const estadoTexto = c.estado === "1" ? "ACTIVO" : "CORTADO";

      return {
        lat,
        lng,
        popup: `
          <div>
            <strong>${nombreCompleto}</strong><br/>
            ${doc}<br/>
            <strong>Dirección:</strong> ${c.cli_direccion}<br/>
            <strong>Servicio:</strong> ${c.serv_nombre}<br/>
            <strong>Estado:</strong> ${estadoTexto}
          </div>
        `,
        color: c.estado === "1" ? "#16a34a" : "#dc2626"
      };
    });

  if (ubicaciones.length === 0) return null;

  const primer = ubicaciones[0];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Mapa de Clientes</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
      <style>
        #map { height: 100vh; width: 100vw; }
        body { margin: 0; }
        .leaflet-popup-content-wrapper { font-family: sans-serif; }
        .custom-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .custom-icon svg {
          stroke: currentColor;
          width: 20px;
          height: 20px;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
      <script>
        const ubicaciones = ${JSON.stringify(ubicaciones)};
        const map = L.map('map').setView([${primer.lat}, ${primer.lng}], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const group = L.featureGroup();

        ubicaciones.forEach(c => {
          const iconHTML = \`
            <div class="custom-icon" style="color: \${c.color};">
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 448 512"><path fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0S96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/></svg>          \`;

          const icon = L.divIcon({
            className: '',
            html: iconHTML,
            iconSize: [24, 24],
            iconAnchor: [12, 24],
          });

          const marker = L.marker([c.lat, c.lng], { icon })
            .bindPopup(c.popup)
            .addTo(map);

          group.addLayer(marker);
        });

        map.fitBounds(group.getBounds());
      </script>
    </body>
    </html>
  `;
}