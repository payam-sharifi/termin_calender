import moment from "moment";
import "moment-timezone";

/** All calendar timeslots are shown and edited in Turkey time, regardless of browser locale. */
export const APP_TIMEZONE = "Europe/Istanbul";

const intlDateDefaults: Intl.DateTimeFormatOptions = {
  timeZone: APP_TIMEZONE,
};

const intlTimeDefaults: Intl.DateTimeFormatOptions = {
  timeZone: APP_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
};

/** UTC ISO from API → calendar Date (wall clock matches Turkey). */
export function isoToCalendarDate(iso: string | Date): Date {
  const m = moment.tz(iso, APP_TIMEZONE);
  return new Date(
    m.year(),
    m.month(),
    m.date(),
    m.hour(),
    m.minute(),
    m.second(),
    m.millisecond(),
  );
}

/** Calendar Date (Turkey wall clock) → UTC ISO for API. */
export function calendarDateToIso(date: Date): string {
  return moment
    .tz(
      {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
        millisecond: date.getMilliseconds(),
      },
      APP_TIMEZONE,
    )
    .toISOString();
}

/** YYYY-MM-DD for the calendar day in Turkey. */
export function toYmdInAppTimezone(date: Date): string {
  return moment
    .tz(
      {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
      },
      APP_TIMEZONE,
    )
    .format("YYYY-MM-DD");
}

export function todayYmdInAppTimezone(): string {
  return moment.tz(APP_TIMEZONE).format("YYYY-MM-DD");
}

/** Current moment as a calendar Date in Turkey wall clock. */
export function nowCalendarDate(): Date {
  const m = moment.tz(APP_TIMEZONE);
  return new Date(
    m.year(),
    m.month(),
    m.date(),
    m.hour(),
    m.minute(),
    m.second(),
    m.millisecond(),
  );
}

export function dayStartIsoInAppTimezone(ymd: string): string {
  return moment.tz(ymd, "YYYY-MM-DD", APP_TIMEZONE).startOf("day").toISOString();
}

export function dayEndIsoInAppTimezone(ymd: string): string {
  return moment.tz(ymd, "YYYY-MM-DD", APP_TIMEZONE).endOf("day").toISOString();
}

/** Format UTC ISO from API in Turkey time. */
export function formatAppDate(
  iso: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    ...intlDateDefaults,
    ...options,
  });
}

export function formatAppTime(
  iso: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(iso).toLocaleTimeString("de-DE", {
    ...intlTimeDefaults,
    ...options,
  });
}

/** Format calendar Date (already Turkey wall clock). */
export function formatCalendarDate(date: Date): string {
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatCalendarTime(date: Date): string {
  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
