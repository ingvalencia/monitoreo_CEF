import React from "react";

export default function TerminalModal({ visible, onClose, cef }) {
  if (!visible) return null;

  const datosSimulados = [
    `Haciendo ping a ${cef.ip}...`,
    `Respuesta de ${cef.ip}: bytes=32 tiempo=45ms TTL=128`,
    `Respuesta de ${cef.ip}: bytes=32 tiempo=46ms TTL=128`,
    `Respuesta de ${cef.ip}: bytes=32 tiempo=47ms TTL=128`,
    `Estadísticas del ping para ${cef.ip}:`,
    `    Paquetes: enviados = 3, recibidos = 3, perdidos = 0 (0% perdidos)`,
    `    Tiempo mínimo = 45ms, máximo = 47ms, promedio = 46ms`,
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-terminal">
        <div className="modal-header">
          <span>🖥️ Terminal - Ping a {cef.cef}</span>
          <button onClick={onClose} className="modal-close">✖</button>
        </div>
        <div className="modal-body">
          {datosSimulados.map((linea, i) => (
            <p key={i}>{linea}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
