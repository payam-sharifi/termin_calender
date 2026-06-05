import { todayYmdInAppTimezone, toYmdInAppTimezone } from "./appTimezone";

/** react-datepicker `dayClassName`: past days + Sonntag */
export function getCalendarDayClassName(date: Date): string {
  const classes: string[] = [];
  const todayYmd = todayYmdInAppTimezone();
  const dateYmd = toYmdInAppTimezone(date);
  if (dateYmd < todayYmd) classes.push("german-datepicker-day--past");
  if (date.getDay() === 0) classes.push("german-datepicker-day--sunday");
  return classes.join(" ");
}

/** react-datepicker `weekDayClassName`: „So“ column header */
export function getCalendarWeekDayClassName(date: Date): string {
  return date.getDay() === 0 ? "german-datepicker-weekday--sunday" : "";
}
