import { format, utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { parseISO } from "date-fns";

// Obtener zona horaria del entorno o usar una por defecto
export const getTimeZone = (): string => {
  return process.env.TIMEZONE || process.env.TZ || "America/Santo_Domingo";
};

// Convertir fecha UTC a zona horaria local
export const toLocalTime = (date: Date | string | number): Date => {
  const timezone = getTimeZone();
  
  let dateObj: Date;
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  return utcToZonedTime(dateObj, timezone);
};

// Convertir fecha local a UTC
export const toUTCTime = (date: Date | string): Date => {
  const timezone = getTimeZone();
  
  let dateObj: Date;
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else {
    dateObj = date;
  }
  
  return zonedTimeToUtc(dateObj, timezone);
};

// Formatear fecha en zona horaria local
export const formatInTimeZone = (
  date: Date | string | number,
  formatString: string
): string => {
  const timezone = getTimeZone();
  
  let dateObj: Date;
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  return format(utcToZonedTime(dateObj, timezone), formatString, { timeZone: timezone });
};

// Obtener timestamp actual en zona horaria local
export const getCurrentTimestamp = (): number => {
  return toLocalTime(new Date()).getTime();
};

// Obtener fecha actual en zona horaria local
export const getCurrentDate = (): Date => {
  return toLocalTime(new Date());
};