"use client";

interface DetalleVenta {
  id: number;
  nombre: string;
  categoria: string;
  cantidad: number;
  precioVenta: number;
  subtotal: number;
}

interface Venta {
  id: number;
  fecha: string;
  total: number;
  metodoPago: "EFECTIVO" | "TRANSFERENCIA";
  detalles: DetalleVenta[];
}

interface Props {
  venta: Venta;
  onClose: () => void;
}

function fmtFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-MX", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
}

export default function ModalDetalleVenta({ venta, onClose }: Props) {
  const totalUnidades = venta.detalles.reduce((s, d) => s + d.cantidad, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-200 border border-gray-300 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-blue-100 border-b border-blue-200 rounded-t-2xl flex-shrink-0">
          <div>
            <h2 className="text-[#0d0d0d] font-bold text-lg">Detalle de venta</h2>
            <p className="text-gray-500 text-xs mt-0.5">Folio #{venta.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {/* Datos generales */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100">
              <p className="text-xs font-semibold text-[#003087] uppercase tracking-wider">Datos generales</p>
            </div>
            <div className="px-4 py-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Fecha y hora</p>
                <p className="text-gray-800 font-medium">{fmtFecha(venta.fecha)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Método de pago</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  venta.metodoPago === "EFECTIVO"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {venta.metodoPago === "EFECTIVO" ? "Efectivo" : "Transferencia"}
                </span>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Total productos</p>
                <p className="text-gray-800 font-medium">{totalUnidades} unidades</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Total venta</p>
                <p className="text-xl font-bold text-[#003087]">
                  ${venta.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Detalle de productos */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100">
              <p className="text-xs font-semibold text-[#003087] uppercase tracking-wider">
                Productos ({venta.detalles.length})
              </p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-100 border-b border-blue-200">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Producto</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Cant.</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {venta.detalles.map((d) => (
                  <tr key={d.id} className="bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{d.nombre}</p>
                      <p className="text-xs text-gray-400">
                        ${d.precioVenta.toLocaleString("es-MX", { minimumFractionDigits: 2 })} c/u
                      </p>
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-gray-800">{d.cantidad}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      ${d.subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 pb-5 pt-1 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
