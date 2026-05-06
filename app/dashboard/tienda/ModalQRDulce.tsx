"use client";
import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface Dulce {
  id: number;
  nombre: string;
}

interface Props {
  dulce: Dulce;
  onClose: () => void;
}

export default function ModalQRDulce({ dulce, onClose }: Props) {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrValue = `${dulce.id}|${dulce.nombre}|`;

  function getCanvas(): HTMLCanvasElement | null {
    return qrRef.current?.querySelector("canvas") ?? null;
  }

  function handlePrint() {
    const canvas = getCanvas();
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>QR — ${dulce.nombre}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { display: flex; flex-direction: column; align-items: center;
             justify-content: center; min-height: 100vh; font-family: sans-serif;
             background: #fff; }
      img { width: 240px; height: 240px; }
      p  { margin-top: 14px; font-size: 13px; color: #444; text-align: center;
           max-width: 260px; }
    </style>
  </head>
  <body>
    <img src="${dataUrl}" alt="QR" />
    <p>${dulce.id} | ${dulce.nombre}</p>
    <script>window.onload = () => { window.print(); };<\/script>
  </body>
</html>`);
    win.document.close();
  }

  function handleSave() {
    const canvas = getCanvas();
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr_${dulce.id}_${dulce.nombre.replace(/\s+/g, "_")}.png`;
    a.click();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-200 border border-gray-300 rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-blue-100 border-b border-blue-200 rounded-t-2xl">
          <h2 className="text-[#0d0d0d] font-bold text-lg">Código QR</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col items-center gap-4">
          {/* QR */}
          <div ref={qrRef} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <QRCodeCanvas
              value={qrValue}
              size={200}
              bgColor="#ffffff"
              fgColor="#0d0d0d"
              level="M"
            />
          </div>

          {/* Info */}
          <div className="text-center">
            <p className="text-gray-800 text-sm font-semibold">{dulce.nombre}</p>
            <p className="text-gray-400 text-xs mt-1">ID: {dulce.id}</p>
          </div>

          {/* Botones — desktop: Imprimir / móvil+tablet: Guardar */}
          <div className="w-full flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-300 text-sm font-medium transition-colors"
            >
              Cerrar
            </button>

            {/* Solo en desktop (md en adelante) */}
            <button
              type="button"
              onClick={handlePrint}
              className="hidden md:flex flex-1 items-center justify-center gap-2 py-2.5 rounded-xl bg-[#003087] hover:bg-[#002060] text-white text-sm font-bold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir
            </button>

            {/* Solo en móvil y tablet (menor a md) */}
            <button
              type="button"
              onClick={handleSave}
              className="flex md:hidden flex-1 items-center justify-center gap-2 py-2.5 rounded-xl bg-[#003087] hover:bg-[#002060] text-white text-sm font-bold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
