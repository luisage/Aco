"use client";
import { useEffect, useRef, useState } from "react";

interface VideoItem {
  id: number;
  nombre: string | null;
  descripcion: string | null;
  url: string;
  publicId: string;
}

function getThumb(url: string): string {
  return url
    .replace("/video/upload/", "/video/upload/so_0,f_jpg,q_auto/")
    .replace(/\.(mp4|mov|avi|webm|mkv)$/i, ".jpg");
}

function PlayIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

export default function VideosClient({ videos }: { videos: VideoItem[] }) {
  const [featured, setFeatured]         = useState(0);
  const [hovered, setHovered]           = useState<number | null>(null);
  const [playing, setPlaying]           = useState(false);
  // mapa id → 'v' | 'h' detectado al cargar el thumbnail
  const [orientations, setOrientations] = useState<Record<number, "v" | "h">>({});
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { setPlaying(false); }, [featured]);

  const fv         = videos[featured] ?? videos[0];
  const isVertical = orientations[fv?.id] === "v";

  function handleThumbLoad(id: number, e: React.SyntheticEvent<HTMLImageElement>) {
    const img    = e.currentTarget;
    const orient = img.naturalWidth < img.naturalHeight ? "v" : "h";
    setOrientations((prev) => (prev[id] === orient ? prev : { ...prev, [id]: orient }));
  }

  function select(i: number) {
    setFeatured(i);
    setPlaying(false);
  }

  return (
    <section id="videos" className="bg-[#0a0a0a] py-14 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">

        <h2 className="text-5xl font-black text-[#c9a227] mb-10" style={{ lineHeight: 1.1 }}>
          Videos
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">

          {/* ── Video destacado ── */}
          <div
            className="relative rounded-[18px] overflow-hidden bg-[#111]"
            style={{
              aspectRatio: isVertical ? "9/16" : "16/9",
              maxHeight: 560,
              width: isVertical ? "auto" : "100%",
            }}
          >
            {playing ? (
              <video
                ref={videoRef}
                src={fv.url}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <img
                  src={getThumb(fv.url)}
                  alt={fv.nombre ?? "Video"}
                  className="w-full h-full object-cover"
                  onLoad={(e) => handleThumbLoad(fv.id, e)}
                />

                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }}
                />


                {/* Botón play */}
                <button
                  onClick={() => setPlaying(true)}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[76px] h-[76px] rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                  style={{
                    background: "rgba(200,16,46,0.88)",
                    boxShadow: "0 0 56px rgba(200,16,46,0.55), 0 0 0 8px rgba(200,16,46,0.18)",
                  }}
                >
                  <PlayIcon size={30} />
                </button>

                {/* Info inferior */}
                <div className="absolute bottom-0 left-0 right-0 px-7 py-6">
                  <h3
                    className="text-2xl font-extrabold text-white mb-1.5"
                    style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
                  >
                    {fv.nombre ?? `Video ${featured + 1}`}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-[7px] h-[7px] rounded-full bg-[#c8102e] flex-shrink-0" />
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                      Video {featured + 1} de {videos.length}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Playlist lateral ── */}
          <div
            className="flex flex-col gap-1.5 overflow-y-auto pr-1
              max-h-[282px] lg:max-h-[498px]
              [&::-webkit-scrollbar]:w-1
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-white/10"
          >
            {videos.map((v, i) => {
              const isActive  = i === featured;
              const isVert    = orientations[v.id] === "v";
              const thumbW    = isVert ? 36 : 72;

              return (
                <button
                  key={v.id}
                  onClick={() => select(i)}
                  onMouseEnter={() => setHovered(v.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-[10px] cursor-pointer text-left w-full transition-all duration-[180ms]"
                  style={{
                    border: isActive ? "1px solid rgba(201,162,39,0.5)" : "1px solid transparent",
                    background: isActive
                      ? "rgba(201,162,39,0.08)"
                      : hovered === v.id ? "rgba(255,255,255,0.05)" : "transparent",
                  }}
                >
                  {/* Thumbnail ítem */}
                  <div
                    className="relative flex-shrink-0 rounded-[7px] overflow-hidden"
                    style={{
                      width: thumbW,
                      height: 46,
                      border: isActive ? "2px solid #c9a227" : "2px solid rgba(255,255,255,0.06)",
                      transition: "border-color .18s",
                    }}
                  >
                    <img
                      src={getThumb(v.url)}
                      alt={v.nombre ?? ""}
                      className="w-full h-full object-cover"
                      onLoad={(e) => handleThumbLoad(v.id, e)}
                    />
                    {isActive && (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: "rgba(200,16,46,0.5)" }}
                      >
                        <PlayIcon size={12} />
                      </div>
                    )}
                  </div>

                  {/* Texto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        className="text-xs font-bold truncate transition-colors duration-[180ms]"
                        style={{ color: isActive ? "#c9a227" : "#fff" }}
                      >
                        {v.nombre ?? `Video ${i + 1}`}
                      </p>
                      {isVert && (
                        <span
                          className="flex-shrink-0 text-[9px] font-bold uppercase px-1 rounded-[3px]"
                          style={{
                            color: "rgba(255,255,255,0.25)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            letterSpacing: 0.4,
                          }}
                        >
                          V
                        </span>
                      )}
                    </div>
                    {v.descripcion && (
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {v.descripcion}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
