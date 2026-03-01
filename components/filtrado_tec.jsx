import { useState } from "react";

const AutocompleteInput = ({ tecnicos, newOrder, setNewOrder }) => {
  const [filteredTecnicos, setFilteredTecnicos] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    const value2 = e.target.key
    setNewOrder({ ...newOrder, tecnico: value, tec_id: value2 });

    if (value.length > 0) {
      const filtered = tecnicos.filter((tecnico) => {
        const nombre = tecnico?.usuario?.usu_nombre?.toLowerCase() || "";
        return nombre.includes(value.toLowerCase());
      });
      setFilteredTecnicos(filtered);
      setShowDropdown(true);
    } else {
      setFilteredTecnicos([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (id, name) => {
    setNewOrder({ ...newOrder, tec_id: id, tecnico: name });
    setShowDropdown(false);
  };

  return (
    <div className="relative space-y-2">
      <label htmlFor="technician" className="text-sm font-medium">
        Técnico Asignado
      </label>

      <input
        type="text"
        id="technician"
        name="technician"
        autoComplete="off"
        className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
        placeholder="Buscar técnico..."
        value={newOrder.tecnico || ""}
        onChange={handleInputChange}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        onFocus={() => {
          if (newOrder.tecnico) setShowDropdown(true);
        }}
      />

      {showDropdown && filteredTecnicos.length > 0 && (
        <ul className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded mt-1 max-h-48 overflow-y-auto">
          {filteredTecnicos.map((tecnico) => (
            <li
              key={tecnico.tec_id}
              onMouseDown={() => handleSelect(tecnico.tec_id, tecnico.usuario.usu_nombre)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-600"
            >
              {tecnico.usuario.usu_nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;
