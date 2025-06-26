import React, { useEffect, useState, useRef } from "react";
import TerminalModal from "./TerminalModal";
import "./Dashboard.css";

export default function Dashboard() {
  const [datos, setDatos] = useState([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [refrescandoCEF, setRefrescandoCEF] = useState(null);
  const [cefModal, setCefModal] = useState(null);
  const refsCEFs = useRef({});

  const obtenerDatos = async () => {
    try {
      const res = await fetch("https://diniz.com.mx/diniz/servicios/services/monitoreo_CEF/monitoreo_cef.php");
      const data = await res.json();
      setDatos(data);
      setUltimaActualizacion(new Date());
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    obtenerDatos();
    const intervalo = setInterval(obtenerDatos, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const formatoHora = (fecha) =>
    fecha?.toLocaleTimeString("es-MX", { hour12: false }) ?? "";

  const formatoFecha = (fecha) =>
    fecha?.toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit"
    }) ?? "";

  const reintentarPing = async (cefActual) => {
    setRefrescandoCEF(cefActual.cef);
    try {
      const res = await fetch("https://diniz.com.mx/diniz/servicios/services/monitoreo_CEF/monitoreo_cef.php");
      const todos = await res.json();
      const actualizado = todos.find((c) => c.cef === cefActual.cef);
      if (actualizado) {
        setDatos((prev) =>
          prev.map((c) => (c.cef === actualizado.cef ? actualizado : c))
        );
      }
    } catch (e) {
      console.error("Error al reintentar ping:", e);
    }
    setRefrescandoCEF(null);
  };

  const datosFiltrados = filtro
    ? datos.filter((cef) =>
        `${cef.cef}${cef.ip}${cef.ping}`
          .toLowerCase()
          .includes(filtro.toLowerCase())
      )
    : datos;

  return (
    <div className="bg-black text-[#00FF9F] font-mono p-4 min-h-screen text-sm">
      <TerminalModal
        visible={!!cefModal}
        onClose={() => setCefModal(null)}
        cef={cefModal}
      />

      <div className="terminal-box">
        <div className="flex justify-between">
          <span>🖥️ code-history v0.1.0</span>
          <span>{formatoHora(ultimaActualizacion)}</span>
        </div>
        <p>$ ./monitor-cef.sh --start</p>
        <p>🟢 Inicializando sistema de monitoreo...</p>
        <p>
          📡 Última actualización: {formatoHora(ultimaActualizacion)} -{" "}
          {formatoFecha(ultimaActualizacion)}
        </p>
      </div>

      <div className="search-box">
        <p className="mb-2">🔍 Buscar CEF/IP/Estado:</p>
        <input
          type="text"
          placeholder="Ej: AAA, 192.168, En línea"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>CEF</th>
            <th>IP</th>
            <th>Estado</th>
            <th>Latencia</th>
            <th>Hora</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {datosFiltrados.map((cef, i) => (
            <tr key={i}>
              <td>{String(i + 1).padStart(2, "0")}</td>
              <td>{cef.cef}</td>
              <td>{cef.ip}</td>
              <td>{cef.ping === "OK" ? "✔️ En línea" : "❌ Error"}</td>
              <td>{cef.latencia_ms ? `${cef.latencia_ms} ms` : "--"}</td>
              <td>{cef.timestamp}</td>
              <td>
                <button
                  className="ping-button"
                  onClick={() => setCefModal(cef)}
                >
                  Ping
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
