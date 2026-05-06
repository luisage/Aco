"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { registrarVenta } from "@/app/actions/ventas";

interface Producto {
  id: number;
  nombre: string;
  costo: number;
  cantidad: number;
  categoria: string;
}

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

const QR_REGEX = /^(\d+)\|([^|]+)\|$/;

export default function VentasClient() {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [buscador, setBuscador] = useState("");
  const [sugerencias, setSugerencias] = useState<Producto[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [metodoPago, setMetodoPago] = useState<"EFECTIVO" | "TRANSFERENCIA">("EFECTIVO");
  const [pago, setPago] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [scanning, setScanning] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanActiveRef = useRef(false);

  // ── Buscar productos ──────────────────────────────────────────
  useEffect(() => {
    const texto = buscador.trim();
    if (!texto) { setSugerencias([]); return; }

    // Formato QR detectado → agregar directo
    const qrMatch = texto.match(QR_REGEX);
    if (qrMatch) {
      const id = parseInt(qrMatch[1], 10);
      fetch(`/api/productos/buscar?q=${id}`)
        .then((r) => r.json())
        .then((prods: Producto[]) => {
          if (prods.length > 0) agregarAlCarrito(prods[0]);
        });
      setBuscador("");
      setSugerencias([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/productos/buscar?q=${encodeURIComponent(texto)}`)
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setSugerencias(data); })
        .catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscador]);

  // ── Carrito ───────────────────────────────────────────────────
  const agregarAlCarrito = useCallback((prod: Producto) => {
    setCarrito((prev) => {
      const existe = prev.find((i) => i.producto.id === prod.id);
      if (existe) return prev.map((i) => i.producto.id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { producto: prod, cantidad: 1 }];
    });
    setBuscador("");
    setSugerencias([]);
    setMostrarSugerencias(false);
    inputRef.current?.focus();
  }, []);

  function cambiarCantidad(id: number, delta: number) {
    setCarrito((prev) =>
      prev.map((i) => i.producto.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i)
    );
  }

  function quitarDelCarrito(id: number) {
    setCarrito((prev) => prev.filter((i) => i.producto.id !== id));
  }

  // ── Totales ───────────────────────────────────────────────────
  const totalProductos = carrito.reduce((s, i) => s + i.cantidad, 0);
  const total = carrito.reduce((s, i) => s + i.producto.costo * i.cantidad, 0);
  const pagoNum = parseFloat(pago) || 0;
  const cambio = pagoNum - total;

  // ── Acciones ──────────────────────────────────────────────────
  function cancelar() {
    setCarrito([]);
    setBuscador("");
    setMetodoPago("EFECTIVO");
    setPago("");
    setError("");
    setExito(false);
    setSugerencias([]);
  }

  async function handleVenta() {
    if (carrito.length === 0) { setError("Agrega al menos un producto."); return; }
    setError("");
    setLoading(true);
    try {
      await registrarVenta(
        carrito.map((i) => ({
          productoId: i.producto.id,
          cantidad: i.cantidad,
          precioVenta: i.producto.costo,
        })),
        metodoPago
      );
      setCarrito([]);
      setBuscador("");
      setPago("");
      setExito(true);
    } catch {
      setError("Error al registrar la venta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // ── Escáner de cámara ─────────────────────────────────────────
  const stopScan = useCallback(() => {
    scanActiveRef.current = false;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  async function startScan() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setScanning(true);
    } catch {
      setError("No se pudo acceder a la cámara.");
    }
  }

  useEffect(() => {
    if (!scanning || !videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    scanActiveRef.current = true;

    const canvas = document.createElement("canvas");
    let timerId: ReturnType<typeof setTimeout>;

    function handleFound(rawValue: string): boolean {
      const m = rawValue.trim().match(QR_REGEX);
      if (!m) return false;
      stopScan();
      const id = parseInt(m[1], 10);
      fetch(`/api/productos/buscar?q=${id}`)
        .then((r) => r.json())
        .then((prods: Producto[]) => { if (prods.length > 0) agregarAlCarrito(prods[0]); });
      return true;
    }

    async function startLoop() {
      const hasBarcodeDetector = "BarcodeDetector" in window;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detector = hasBarcodeDetector
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? new (window as any).BarcodeDetector({ formats: ["qr_code"] })
        : null;

      const jsQR = hasBarcodeDetector
        ? null
        : (await import("jsqr")).default;

      async function scan() {
        if (!scanActiveRef.current) return;
        try {
          if (detector) {
            // API nativa — usa hardware del dispositivo, mejor detección en móvil
            const codes = await detector.detect(video);
            for (const c of codes) {
              if (handleFound(c.rawValue)) return;
            }
          } else if (jsQR && video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
            canvas.width  = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(video, 0, 0);
              const img  = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(img.data, img.width, img.height);
              if (code && handleFound(code.data)) return;
            }
          }
        } catch { /* ignorar errores de frame */ }
        if (scanActiveRef.current) timerId = setTimeout(scan, 250);
      }

      scan();
    }

    video.play().then(startLoop).catch(startLoop);

    return () => {
      scanActiveRef.current = false;
      clearTimeout(timerId);
    };
  }, [scanning, stopScan, agregarAlCarrito]);

  // ── UI ────────────────────────────────────────────────────────
  return (
    <>
      {/* Overlay de cámara (móvil/tablet) */}
      {scanning && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-4 p-4">
          <p className="text-white text-sm font-medium">Apunta al código QR del producto</p>
          <video
            ref={videoRef}
            className="w-full max-w-sm rounded-2xl"
            playsInline
            muted
          />
          <button
            onClick={stopScan}
            className="px-8 py-2.5 bg-[#C8102E] hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      <div className="space-y-5">
        {/* Buscador */}
        <div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#003087] pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/>
                  <path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/>
                  <path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/>
                  <path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>
                </svg>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={buscador}
                onChange={(e) => { setBuscador(e.target.value); setMostrarSugerencias(true); setExito(false); }}
                onFocus={() => setMostrarSugerencias(true)}
                onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
                placeholder="Nombre, ID o escanea el QR..."
                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors"
              />
              {/* Dropdown sugerencias */}
              {mostrarSugerencias && sugerencias.length > 0 && (
                <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {sugerencias.map((p) => (
                    <button
                      key={p.id}
                      onMouseDown={() => agregarAlCarrito(p)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors text-left"
                    >
                      <div>
                        <span className="font-medium text-gray-800">{p.nombre}</span>
                        <span className="ml-2 text-xs text-gray-400">{p.categoria}</span>
                      </div>
                      <span className="text-gray-600 font-semibold ml-4 flex-shrink-0">
                        ${p.costo.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Botón cámara — solo en tablet/celular */}
            <button
              onClick={startScan}
              className="md:hidden flex items-center gap-1.5 bg-[#003087] hover:bg-[#002060] text-white px-4 py-2.5 rounded-xl transition-colors flex-shrink-0"
              title="Escanear QR con cámara"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-semibold">Cámara</span>
            </button>
          </div>
        </div>

        {/* Layout dos columnas en desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

          {/* Carrito */}
          <div className="border border-gray-300 rounded-2xl overflow-hidden bg-gray-200">
            <div className="px-5 py-3.5 bg-blue-100 border-b border-blue-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#003087]">Productos seleccionados</h3>
              {totalProductos > 0 && (
                <span className="text-xs font-semibold bg-[#003087] text-white px-2 py-0.5 rounded-full">
                  {totalProductos}
                </span>
              )}
            </div>
            <div className="bg-gray-200">
              {carrito.length === 0 ? (
                <div className="bg-gray-200 px-5 py-14 text-center">
                  <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-400 text-sm">Sin productos agregados</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-300">
                  {carrito.map(({ producto, cantidad }) => (
                    <div key={producto.id} className="flex items-center gap-3 px-5 py-3.5 bg-gray-200 hover:bg-gray-100 transition-colors">
                      {/* Quitar */}
                      <button
                        onClick={() => quitarDelCarrito(producto.id)}
                        className="text-gray-400 hover:text-[#C8102E] transition-colors flex-shrink-0"
                        title="Quitar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {/* Nombre */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{producto.nombre}</p>
                        <p className="text-xs text-gray-500">
                          ${producto.costo.toLocaleString("es-MX", { minimumFractionDigits: 2 })} c/u
                        </p>
                      </div>
                      {/* Controles cantidad */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => cambiarCantidad(producto.id, -1)}
                          className="w-6 h-6 rounded-full border border-gray-400 text-gray-600 hover:bg-gray-300 flex items-center justify-center text-base font-bold leading-none transition-colors"
                        >−</button>
                        <span className="w-5 text-center text-sm font-semibold text-gray-800">{cantidad}</span>
                        <button
                          onClick={() => cambiarCantidad(producto.id, 1)}
                          className="w-6 h-6 rounded-full border border-gray-400 text-gray-600 hover:bg-gray-300 flex items-center justify-center text-base font-bold leading-none transition-colors"
                        >+</button>
                      </div>
                      {/* Subtotal */}
                      <p className="w-20 text-right text-sm font-semibold text-gray-800 flex-shrink-0">
                        ${(producto.costo * cantidad).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel resumen */}
          <div className="space-y-4">
            <div className="border border-gray-300 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 bg-blue-100 border-b border-blue-200">
                <h3 className="text-sm font-semibold text-[#003087]">Resumen</h3>
              </div>
              <div className="bg-gray-200 px-5 py-5 space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Total ({totalProductos} {totalProductos === 1 ? "producto" : "productos"})
                  </span>
                  <span className="text-xl font-bold text-gray-800">
                    ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Método de pago */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">
                    Método de pago
                  </label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value as "EFECTIVO" | "TRANSFERENCIA")}
                    className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors cursor-pointer"
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                </div>

                {/* Pago recibido */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">
                    Pago recibido ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={pago}
                    onChange={(e) => { setPago(e.target.value); setError(""); setExito(false); }}
                    placeholder="0.00"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors"
                  />
                </div>

                {/* Cambio */}
                {pagoNum > 0 && (
                  <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                    cambio >= 0
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}>
                    <span className="text-sm font-medium text-gray-600">
                      {cambio >= 0 ? "Cambio" : "Falta"}
                    </span>
                    <span className={`text-lg font-bold ${cambio >= 0 ? "text-green-700" : "text-[#C8102E]"}`}>
                      ${Math.abs(cambio).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {error && (
                  <p className="text-[#C8102E] text-sm bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl px-4 py-2.5">
                    {error}
                  </p>
                )}

                {exito && (
                  <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 font-medium">
                    ¡Venta registrada correctamente!
                  </p>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={cancelar}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleVenta}
                disabled={loading || carrito.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {loading ? "Procesando..." : "Realizar venta"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
