import moment from "moment";
import "moment-timezone";
import { APP_TIMEZONE, toYmdInAppTimezone, todayYmdInAppTimezone } from "./appTimezone";

const PAST_WINDOW_DAYS = 15;
const MONTH_CUTOFF_DAY = 15;

/**
 * Earliest visible past day (YYYY-MM-DD):
 * - If today is after the 15th → from the 15th of the current month
 * - Otherwise → max(today − 15 days, 1st of current month)
 */
export function getEarliestVisiblePastYmd(): string {
  const now = moment.tz(APP_TIMEZONE);

  if (now.date() > MONTH_CUTOFF_DAY) {
    return now.clone().date(MONTH_CUTOFF_DAY).format("YYYY-MM-DD");
  }

  const monthStart = now.clone().startOf("month").format("YYYY-MM-DD");
  const windowStart = now
    .clone()
    .subtract(PAST_WINDOW_DAYS, "days")
    .format("YYYY-MM-DD");
  return windowStart > monthStart ? windowStart : monthStart;
}

export function isPastAppointmentVisible(isoOrDate: string | Date): boolean {
  const ymd =
    typeof isoOrDate === "string"
      ? moment.tz(isoOrDate, APP_TIMEZONE).format("YYYY-MM-DD")
      : toYmdInAppTimezone(isoOrDate);
  const today = todayYmdInAppTimezone();
  if (ymd >= today) return true;
  return ymd >= getEarliestVisiblePastYmd();
}

export function isCalendarDayNavigable(date: Date): boolean {
  const ymd = toYmdInAppTimezone(date);
  const today = todayYmdInAppTimezone();
  if (ymd >= today) return true;
  return ymd >= getEarliestVisiblePastYmd();
}

export function earliestVisiblePastCalendarDate(): Date {
  const ymd = getEarliestVisiblePastYmd();
  const [y, m, d] = ymd.split("-").map((part) => parseInt(part, 10));
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function clampToNavigableCalendarDay(date: Date): Date {
  return isCalendarDayNavigable(date) ? date : earliestVisiblePastCalendarDate();
}
