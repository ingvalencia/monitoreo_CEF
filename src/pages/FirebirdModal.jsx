import React from "react";

export default function FirebirdModal({ visible, onClose, detalle }) {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-terminal">
        <div className="modal-header">
          <span>🛠️ Detalle Firebird - {detalle.cef}</span>
          <button onClick={onClose} className="modal-close">✖</button>
        </div>
        <div className="modal-body">
          <pre>
{JSON.stringify(
  {
    ping: detalle.firebird,
    latencia: detalle.fb_latencia_ms,
    error: detalle.fb_error
  },
  null,
  2
)}
          </pre>
        </div>
      </div>
    </div>
  );
}
