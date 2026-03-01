import { useState } from "react";

const AutocompleteInput = ({ clientes, newOrder, setNewOrder }) => {
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Función para obtener el nombre según el tipo
  const getNombreCliente = (cliente) => {
    if (cliente.cli_tipo === "NATURAL") {
      return `${cliente.cli_nombre} ${cliente.cli_apellido || ""}`.trim();
    } else if (cliente.cli_tipo === "JURIDICA") {
      return cliente.cli_razonsoci || "";
    }
    return "";
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewOrder({ ...newOrder, cliente: value });

    if (value.length > 0) {
      const filtered = clientes.filter((cliente) => {
        const nombre = getNombreCliente(cliente).toLowerCase();
        return nombre.includes(value.toLowerCase());
      });
      setFilteredClientes(filtered);
      setShowDropdown(true);
    } else {
      setFilteredClientes([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (cliente) => {
    const nombreCompleto = getNombreCliente(cliente);

    setNewOrder({
      ...newOrder,
      num_con: cliente.num_con,
      cliente: nombreCompleto,
      direccion: cliente.cli_direccion,
      servicio_actual: cliente.serv_nombre || "", // o el campo real del servicio
    });

    setShowDropdown(false);
  };

  return (
    <div className="relative space-y-2">
      <label htmlFor="client" className="text-sm font-medium">
        Cliente
      </label>

      <input
        type="text"
        id="client"
        name="client"
        autoComplete="off"
        className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
        placeholder="Buscar cliente..."
        value={newOrder.cliente || ""}
        onChange={handleInputChange}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        onFocus={() => {
          if (newOrder.cliente) setShowDropdown(true);
        }}
      />

      {showDropdown && filteredClientes.length > 0 && (
        <ul className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded mt-1 max-h-48 overflow-y-auto">
          {filteredClientes.map((cliente) => (
            <li
              key={cliente.num_con}
              onMouseDown={() => handleSelect(cliente)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-600"
            >
              {getNombreCliente(cliente)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;
