"use client";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import Card from "@/resources/Card";
import { CustomEvent, DropEvent, DraggedEventType } from "./Types";
import { adjEvents } from "./Types";
import { useCallback, useMemo, useState } from "react";
import { stringOrDate } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
//import "@/resources/calendar.css";

const formatName = (name: any, count: any) => `${name} ID ${count}`;
const DragAndDropCalendar = withDragAndDrop(Calendar);

export default function DnDCalender({ data }: any) {

  const adjEvents1 = data.map((it: any, ind: any) => ({
    ...it,
    isDraggable: ind % 2 === 0,
  }));
 
  const [myEvents, setMyEvents] = useState<CustomEvent[]>(adjEvents1);
  const [draggedEvent, setDraggedEvent] = useState<
    DraggedEventType | "undroppable" | undefined
  >();
  const [displayDragItemInCell, setDisplayDragItemInCell] = useState(true);
  const [counters, setCounters] = useState({ item1: 0, item2: 0 });

  const eventPropGetter = useCallback(
    (event: any) => ({
      ...(event.isDraggable
        ? { className: "isDraggable" }
        : { className: "nonDraggable" }),
    }),
    []
  );
  const handleDragStart = useCallback(
    (event: any) => setDraggedEvent(event),
    []
  );

  const handleDisplayDragItemInCell = useCallback(
    () => setDisplayDragItemInCell((prev) => !prev),
    []
  );

  const moveEvent = useCallback(
    (args: {
      event: any;
      start: stringOrDate;
      end: stringOrDate;
      isAllDay?: boolean;
    }) => {
      const { event, start, end, isAllDay: droppedOnAllDaySlot = false } = args;
      const { allDay } = event;
      if (!allDay && droppedOnAllDaySlot) {
        event.allDay = true;
      }

      setMyEvents((prev: any) => {
        const existing = prev.find((ev: any) => ev.id === event.id) ?? {};
        const filtered = prev.filter((ev: any) => ev.id !== event.id);
        console.log([...filtered, { ...existing, start, end, allDay }], "setMyEvents");
        return [...filtered, { ...existing, start, end, allDay }];
      });
      
    },

    [setMyEvents]
  );

  const newEvent = useCallback(
    (event: any) => {
      setMyEvents((prev) => {
        const idList = prev.map((item) => item.id);
        const newId = Math.max(...idList) + 1;
        console.log([...prev, { ...event, id: newId }], "newEvent");
        return [...prev, { ...event, id: newId }];
      });
      
    },
    [setMyEvents]
  );

  const onDropFromOutside = useCallback(
    ({ start, end, allDay: isAllDay }: DropEvent) => {
      if (draggedEvent === "undroppable") {
        setDraggedEvent(undefined);
        return;
      }

      if (!draggedEvent) return;

      const { name } = draggedEvent;
      const event = {
        title: formatName(name, counters[name as keyof typeof counters]),
        start,
        end,
        isAllDay,
        isDraggable: true,
      };

      setDraggedEvent(undefined);
      setCounters((prev) => {
        const count = prev[name as keyof typeof prev];
        return {
          ...prev,
          [name]: count + 1,
        };
      });
      newEvent(event);
    },
    [draggedEvent, counters, setDraggedEvent, setCounters, newEvent, myEvents]
  );

  const resizeEvent = useCallback(
    ({ event, start, end }: any) => {
      setMyEvents((prev: any) => {
        const existing = prev.find((ev: any) => ev.id === event.id) ?? {};
        const filtered = prev.filter((ev: any) => ev.id !== event.id);
        console.log([...filtered, { ...existing, start, end }], "resizeEvent");
        return [...filtered, { ...existing, start, end }];
      });
    
    },

    [setMyEvents]
  );

  const defaultDate = useMemo(() => new Date(Date.now()), []);
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

  return (
    <div className="calendar-container">
      <Card className="dndOutsideSourceExample">
        <div className="inner">
          <h4>Outside Drag Sources</h4>
          <p>
            Lighter colored events, in the Calendar, have an `isDraggable` key
            of `false`.
          </p>
          {Object.entries(counters).map(([name, count]) => (
            <div
              draggable="true"
              key={name}
              onDragStart={() =>
                handleDragStart({ title: formatName(name, count), name })
              }
            >
              {formatName(name, count)}
            </div>
          ))}
          <div
            draggable="true"
            onDragStart={() => handleDragStart("undroppable")}
          >
            Draggable but not for calendar.
          </div>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={displayDragItemInCell}
              onChange={handleDisplayDragItemInCell}
            />
            Display dragged item in cell while dragging over
          </label>
        </div>
      </Card>
      <div className="height600">
        <DragAndDropCalendar
          defaultDate={defaultDate}
          localizer={localizer}
          defaultView={Views.DAY}
          eventPropGetter={eventPropGetter}
          draggableAccessor={() => true}
          events={myEvents}
          onEventDrop={moveEvent}
          onEventResize={resizeEvent}
          onSelectSlot={newEvent}
          resizable
          selectable
          onDropFromOutside={onDropFromOutside}
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
}
