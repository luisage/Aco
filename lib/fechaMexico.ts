/**
 * Devuelve la fecha y hora actual en la zona horaria America/Mexico_City
 * construida como timestamp UTC con esos valores.
 * Usar siempre que se quiera guardar "la hora actual de México" en la BD.
 */
export function ahoraEnMexico(): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) => {
    const val = parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10);
    return type === "hour" && val === 24 ? 0 : val;
  };

  return new Date(
    Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"))
  );
}

/**
 * Devuelve solo la fecha de hoy en México (sin hora, medianoche UTC).
 * Usar para campos @db.Date que deben reflejar el día en México.
 */
export function fechaHoyMexico(): Date {
  const mx = ahoraEnMexico();
  return new Date(Date.UTC(mx.getUTCFullYear(), mx.getUTCMonth(), mx.getUTCDate()));
}
