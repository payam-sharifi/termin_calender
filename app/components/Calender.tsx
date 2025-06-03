"use client"; // الزامی برای استفاده از کتابخانه‌های کلاینت-ساید در App Router

import { Calendar, Views, DateLocalizer } from "react-big-calendar";
import { Event, stringOrDate } from "react-big-calendar";

import PropTypes from "prop-types";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import importedEvents from "@/resources/events";
import { Fragment, useCallback, useMemo, useState } from "react";

import "react-big-calendar/lib/addons/";
import Card from "@/resources/Card";

const adjEvents = importedEvents.map((it, ind) => ({
  ...it,
  isDraggable: ind % 2 === 0,
}));
const formatName = (name: any, count: any) => `${name} ID ${count}`;

const DragAndDropCalendar = withDragAndDrop(Calendar);

interface CustomEvent extends Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  desc?: string;
  isDraggable: boolean;
}

interface DragEvent {
  event: CustomEvent;
  start: Date;
  end: Date;
  isAllDay?: boolean;
}

interface DropEvent {
  start: Date | string;
  end: Date | string;
  allDay: boolean;
}

interface DraggedEventType {
  title: string;
  name: string;
}

export default function Calender({ localizer }: any) {
  const [myEvents, setMyEvents] = useState<CustomEvent[]>(adjEvents);
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
  //,
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
        return [...filtered, { ...existing, start, end }];
      });
    },
    [setMyEvents]
  );

  const defaultDate = useMemo(() => new Date(2015, 3, 12), []);

  return (
    <Fragment>
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
          defaultView={Views.MONTH}
          draggableAccessor={() => true}
          eventPropGetter={eventPropGetter}
          events={myEvents}
          localizer={localizer}
          onDropFromOutside={onDropFromOutside}
          onEventDrop={moveEvent}
          onEventResize={resizeEvent}
          onSelectSlot={newEvent}
          resizable
          selectable
        />
      </div>
    </Fragment>
  );
}
Calender.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
};
