"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Calendar,
  Views,
  dateFnsLocalizer,
  Event as CalendarEvent,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import EventFormModal from "./EventFormModal";
import ServicesList from "././ServicesList";
import { Col, Row, Stack } from "react-bootstrap";
import EventDetailsModal from "./EventDetailsModal";

interface Service {
  id: number;
  name: string;
  color: string;
  duration: number;
  price: number;
  providerName: string;
}

interface Event extends CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  service: Service;
  customerName: string;
  customerFamily: string;
  customerEmail: string;
  customerPhone: string;
  description?: string;
}

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DragAndDropCalendar = withDragAndDrop(Calendar);

export default function MyCalendarClient({ eventsObj }: any) {
  console.log('Initial eventsObj:', eventsObj);
  const initialEvents = useMemo(() => {
    console.log('Creating initialEvents from:', eventsObj);
    return eventsObj || [];
  }, [eventsObj]);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [currentView, setCurrentView] = useState<
    (typeof Views)[keyof typeof Views]
  >(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(
    initialEvents.length > 0 ? new Date(initialEvents[0].start) : new Date()
  );
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    console.log('Updating events from eventsObj:', eventsObj);
    setEvents(eventsObj || []);
  }, [eventsObj]);

  const handleSelectSlot = useCallback(
    (slotInfo: any) => {
      console.log("Slot selected:", slotInfo);
      setSelectedSlot({
        start: new Date(slotInfo.start),
        end: new Date(slotInfo.end),
      });
      setIsModalOpen(true);
    },
    []
  );

  const handleServiceSelect = useCallback((service: Service) => {
    setSelectedService(service);
  }, []);

  const handleDeleteEvent = useCallback((eventId: number) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
  }, []);

  const handleEditEvent = useCallback((event: Event) => {
    setSelectedEvent(event);
    setSelectedSlot({
      start: new Date(event.start),
      end: new Date(event.end),
    });
    setSelectedService(event.service);
    setIsEditMode(true);
    setIsDetailsModalOpen(false);
    setIsModalOpen(true);
  }, []);

  const handleEventSubmit = useCallback(async (eventData: any) => {
    try {
      setEvents((prev) => {
        if (isEditMode && selectedEvent) {
          // Update existing event
          const updatedEvents = prev.map((event) =>
            event.id === selectedEvent.id ? { ...event, ...eventData } : event
          );
          console.log("Updating existing event:", updatedEvents);
          return updatedEvents;
        } else {
          // Create new event
          const newEvent = {
            id: prev.length + 1,
            ...eventData,
          };
          console.log("Adding new event:", newEvent);
          const updatedEvents = [...prev, newEvent];
          console.log("Events after update:", updatedEvents);
          return updatedEvents;
        }
      });
      setSelectedService(null);
      setSelectedSlot(null);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error saving event:", error);
    }
  }, [isEditMode, selectedEvent]);

  const moveEvent = useCallback(
    ({ event, start, end }: any) => {
      const typedEvent = event as Event;
      setEvents((prev) => {
        const existing = prev.find((ev) => ev.id === typedEvent.id);
        if (!existing) return prev;
        const filtered = prev.filter((ev) => ev.id !== typedEvent.id);
        return [...filtered, { ...existing, start, end }];
      });
    },
    [setEvents]
  );

  const resizeEvent = useCallback(
    ({ event, start, end }: any) => {
      const typedEvent = event as Event;
      setEvents((prev) => {
        const existing = prev.find((ev) => ev.id === typedEvent.id);
        if (!existing) return prev;
        const filtered = prev.filter((ev) => ev.id !== typedEvent.id);
        return [...filtered, { ...existing, start, end }];
      });
    },
    [setEvents]
  );

  const handleEventClick = useCallback((event: CalendarEvent) => {
    const typedEvent = event as Event;
    setSelectedEvent(typedEvent);
    setIsDetailsModalOpen(true);
  }, []);

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const typedEvent = event as Event;
    return {
      style: {
        backgroundColor: typedEvent.service.color,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
        padding: "2px 4px",
        fontSize: "0.9em",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      },
    };
  }, []);

  const handleDropFromOutside = useCallback(
    ({ start, end, allDay, allday, event }: any) => {
      console.log("onDropFromOutside triggered!");
      console.log("slotInfo:", { start, end, allDay, allday, event });
      console.log("selectedService:", selectedService);

      if (selectedService) {
        setSelectedSlot({
          start: new Date(start),
          end: new Date(end),
        });
        setIsModalOpen(true);
      } else {
        console.warn("Service not selected when dropping onto calendar.");
      }
    },
    [selectedService]
  );

  const handleDragStart = useCallback((service: Service) => {
    setSelectedService(service);
  }, []);

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const handleViewChange = useCallback(
    (newView: (typeof Views)[keyof typeof Views]) => {
      setCurrentView(newView);
    },
    []
  );

  // Mock services data - replace with your actual services data
  const services: Service[] = [
    {
      id: 1,
      name: "Haircut",
      color: "#ff0000",
      duration: 30,
      price: 30,
      providerName: "John Doe"
    },
    {
      id: 2,
      name: "Hair Coloring",
      color: "#00ff00",
      duration: 60,
      price: 80,
      providerName: "Jane Smith"
    },
    {
      id: 3,
      name: "Manicure",
      color: "#0000ff",
      duration: 45,
      price: 40,
      providerName: "Mike Johnson"
    }
  ];

  const components = {
    event: ({ event }: { event: CalendarEvent }) => {
      if (!event) return null;
      const typedEvent = event as Event;
      const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit'
        });
      };

      // Show more details in day view
      if (currentView === Views.DAY) {
        return (
          <div style={{ padding: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
              {typedEvent.title}
            </div>
            <div style={{ fontSize: '0.9em', marginBottom: '2px' }}>
              {formatTime(typedEvent.start)} - {formatTime(typedEvent.end)}
            </div>
            <div style={{ fontSize: '0.9em', marginBottom: '2px' }}>
              {typedEvent.customerName} {typedEvent.customerFamily}
            </div>
            <div style={{ fontSize: '0.9em' }}>
              {typedEvent.service.name} ({typedEvent.service.providerName})
            </div>
          </div>
        );
      }

      // Simple display for other views
      return (
        <div style={{ padding: '2px' }}>
          {typedEvent.title}
        </div>
      );
    }
  };

  return (
    <>
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        startAccessor={(event: any) => new Date(event.start)}
        endAccessor={(event: any) => new Date(event.end)}
        style={{ height: "100vh" }}
        defaultView={Views.MONTH}
        defaultDate={currentDate}
        views={["month", "week", "day", "agenda"]}
        onEventDrop={moveEvent}
        onEventResize={resizeEvent}
        selectable
        onSelectSlot={handleSelectSlot}
        onDropFromOutside={handleDropFromOutside}
        resizable
        step={30}
        timeslots={2}
        eventPropGetter={eventStyleGetter}
        date={currentDate}
        view={currentView}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        onSelectEvent={handleEventClick}
        popup
        messages={{
          next: "Weiter",
          previous: "Zurück",
          today: "Heute",
          month: "Monat",
          week: "Woche",
          day: "Tag",
          agenda: "Agenda",
          date: "Datum",
          time: "Zeit",
          event: "Termin",
          noEventsInRange: "Keine Termine in diesem Zeitraum.",
          allDay: "Ganztägig",
        }}
        components={components}
      />
      <EventFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setSelectedEvent(null);
        }}
        onSubmit={handleEventSubmit}
        selectedSlot={selectedSlot || undefined}
        selectedService={selectedService || undefined}
        services={services}
        initialData={isEditMode ? selectedEvent : undefined}
      />
      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        event={selectedEvent}
        onDelete={handleDeleteEvent}
        onEdit={handleEditEvent}
      />
    </>
  );
}
