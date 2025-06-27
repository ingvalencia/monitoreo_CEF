import { useEffect, useState } from "react";
import "./Dashboard.css";
import FirebirdModal from "./FirebirdModal";
import TerminalModal from "./TerminalModal";

export default function Dashboard() {
  const [datos, setDatos] = useState([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [refrescandoCEF, setRefrescandoCEF] = useState(null);
  const [cefModal, setCefModal] = useState(null);
  const [detalleFB, setDetalleFB] = useState(null);

  const obtenerFirebird = async (cefItem) => {
    const params = new URLSearchParams({
      ip: cefItem.ip,
      db: cefItem.rutadb,
      user: cefItem.userdb,
      pass: cefItem.passdb,
      cef: cefItem.cef
    });

    try {
      const res = await fetch(`http://192.168.56.1:5077/ping?${params}`);
      const data = await res.json();
      return {
        ...cefItem,
        firebird: data.ping,
        fb_latencia_ms: data.latencia_ms,
        fb_error: data.error
      };
    } catch (e) {
      return {
        ...cefItem,
        firebird: "Error",
        fb_latencia_ms: null,
        fb_error: "No se pudo contactar el microservicio"
      };
    }
  };

  const obtenerDatos = async () => {
    try {
      const res = await fetch(
        "https://diniz.com.mx/diniz/servicios/services/monitoreo_CEF/monitoreo_cef.php"
      );
      const dataBase = await res.json();

      const datosConFirebird = await Promise.all(dataBase.map(obtenerFirebird));
      setDatos(datosConFirebird);
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
      day: "2-digit",
    }) ?? "";

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

      <FirebirdModal
        visible={!!detalleFB}
        onClose={() => setDetalleFB(null)}
        detalle={detalleFB}
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
            <th>Firebird</th>
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
              <td title={cef.fb_error || ""}>
                {cef.firebird === "OK" ? "✔️ OK" : "❌ Error"}
              </td>
              <td className="flex flex-col gap-1">
                <button
                  className="ping-button"
                  onClick={() => setCefModal(cef)}
                >
                  Ping
                </button>
                <button
                  className="ping-button"
                  onClick={() => setDetalleFB(cef)}
                >
                  Detalle FB
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
