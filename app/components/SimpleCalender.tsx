"use client"; // الزامی برای استفاده از کتابخانه‌های کلاینت-ساید در App Router

import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import {format} from "date-fns/format";
import {parse} from "date-fns/parse";
import {startOfWeek} from "date-fns/startOfWeek";
import {getDay} from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";

// تعریف نوع رویداد (اختیاری، اما توصیه می‌شود)
interface MyEvent extends Event {
  title: string;
  start: Date;
  end: Date;
}

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const events: MyEvent[] = [
  {
    title: "جلسه مهم",
    start: new Date(2025, 5, 5, 9, 0), 
    end: new Date(2025, 5, 5, 10, 0),
  },
];

export default function SimpleCalneder() {
  return (
    <div style={{ height: "500px", margin: "20px" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
      />
    </div>
  );
}