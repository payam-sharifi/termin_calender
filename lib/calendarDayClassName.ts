/** react-datepicker `dayClassName`: past days + Sonntag */
export function getCalendarDayClassName(date: Date): string {
  const classes: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (d < today) classes.push("german-datepicker-day--past");
  if (date.getDay() === 0) classes.push("german-datepicker-day--sunday");
  return classes.join(" ");
}

/** react-datepicker `weekDayClassName`: „So“ column header */
export function getCalendarWeekDayClassName(date: Date): string {
  return date.getDay() === 0 ? "german-datepicker-weekday--sunday" : "";
}
