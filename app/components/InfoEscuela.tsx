"use client";
import { useState } from "react";

const MAPS_URL = "https://maps.app.goo.gl/tu-link-aqui";
const TEL      = "7731836696";
const TEL_DISPLAY = "773 183 6696";

function IcoPin() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function IcoPhone() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function IcoClock() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function IcoArrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7"/>
      <polyline points="7 7 17 7 17 17"/>
    </svg>
  );
}

function Card({
  icon, color, label, children,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex-1 min-w-[260px] flex flex-col items-center text-center"
      style={{
        background:    hov ? "#161616" : "#111",
        border:        hov ? `1px solid ${color}40` : "1px solid rgba(255,255,255,0.06)",
        borderRadius:  20,
        padding:       "40px 36px",
        boxShadow:     hov ? `0 8px 40px ${color}18` : "0 2px 12px rgba(0,0,0,0.3)",
        transform:     hov ? "translateY(-4px)" : "translateY(0)",
        transition:    "all .25s ease",
        cursor:        "default",
      }}
    >
      {/* Círculo ícono */}
      <div
        style={{
          width: 68, height: 68, borderRadius: "50%",
          background: `${color}18`,
          border: `1.5px solid ${color}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color,
          marginBottom: 20,
          boxShadow: hov ? `0 0 28px ${color}30` : "none",
          transition: "all .25s",
        }}
      >
        {icon}
      </div>

      {/* Label */}
      <div
        className="font-extrabold uppercase"
        style={{ fontSize: 11, color, letterSpacing: 3, marginBottom: 16 }}
      >
        {label}
      </div>

      {/* Divisor */}
      <div style={{ width: 32, height: 2, borderRadius: 2, background: `${color}50`, marginBottom: 20 }} />

      {/* Contenido */}
      <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  );
}

export default function InfoEscuela() {
  return (
    <section id="info" className="bg-[#0a0a0a] px-6 sm:px-12" style={{ padding: "72px 48px" }}>
      {/* Título */}
      <h2
        className="text-center font-black uppercase"
        style={{ fontSize: 42, color: "#c9a227", letterSpacing: 6, marginBottom: 56 }}
      >
        Nuestra Escuela
      </h2>

      {/* Cards */}
      <div
        className="flex flex-col sm:flex-row flex-wrap gap-5 mx-auto"
        style={{ maxWidth: 1100 }}
      >
        {/* Dirección */}
        <Card icon={<IcoPin />} color="#c8102e" label="Dirección">
          <div style={{ fontWeight: 600, color: "#fff", fontSize: 16, marginBottom: 6 }}>
            Av del Norte No. 64
          </div>
          <div>3er Piso, Tlaminulpa</div>
          <div>Atitalaquia, Hidalgo</div>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 font-bold uppercase hover:opacity-100 transition-opacity"
            style={{ color: "#c8102e", fontSize: 12, letterSpacing: 1, opacity: 0.85, textDecoration: "none" }}
          >
            Ver en mapa <IcoArrow />
          </a>
        </Card>

        {/* Contacto */}
        <Card icon={<IcoPhone />} color="#1a4db5" label="Contacto">
          <div style={{ fontWeight: 700, color: "#fff", fontSize: 22, marginBottom: 6, letterSpacing: 1 }}>
            {TEL_DISPLAY}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
            Llámanos para agendar<br />tu clase de prueba gratuita
          </div>
          <a
            href={`tel:${TEL}`}
            className="inline-flex items-center gap-1.5 mt-4 font-bold uppercase hover:opacity-100 transition-opacity"
            style={{ color: "#1a4db5", fontSize: 12, letterSpacing: 1, opacity: 0.85, textDecoration: "none" }}
          >
            Llamar ahora <IcoArrow />
          </a>
        </Card>

        {/* Horarios */}
        <Card icon={<IcoClock />} color="#c9a227" label="Horarios">
          <div className="flex flex-col w-full" style={{ gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: "#c9a227", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                Lunes – Viernes
              </div>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>4:00 pm – 9:00 pm</div>
            </div>
            <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.07)" }} />
            <div>
              <div style={{ fontSize: 12, color: "#c9a227", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                Sábado
              </div>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>9:00 am – 1:00 pm</div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
