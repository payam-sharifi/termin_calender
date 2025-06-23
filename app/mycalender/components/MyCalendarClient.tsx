"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Calendar,
  Views,
  Event as CalendarEvent,
  Components,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import EventFormModal from "./EventFormModal";
import EventDetailsModal from "./EventDetailsModal";
import SafeDeleteModal from "./SafeDeleteModal";
import {
  serviceType,
  ServiceRsDataType,
} from "@/services/servicesApi/Service.types";
import { Event } from "../types/event";
import GermanDatePicker from "./Datapicker";
import { momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment-timezone";
import "@/styles/calender-override.css";
import { useDeleteService } from "@/services/hooks/serviices/useDeleteService";
import {
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaChevronRight,
  FaChevronLeft,
  FaBars,
} from "react-icons/fa";
import Link from "next/link";
import useLogout from "@/hooks/useLogout";
import { useUpdateTimeSlotDate } from "@/services/hooks/timeSlots/useUpdateTimeSlotDate";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { UserRsDataType } from "@/services/userApi/user.types";

moment.locale("de");
const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

// Add custom styles for weekend days
const customStyles = `
  .rbc-off-range-bg {
    background: #f5f5f5;
  }
  .rbc-today {
    background-color: #e6f1e7;
  }
  .rbc-day-sat, .rbc-day-sun {
    color: red;
  }
  .rbc-event {
    background-color: #4a90e2;
    border: none;
  }
`;

export default function MyCalendarClient({
  eventsObj,
  services,
  onDateRangeChange,
  provider_id,
  userProfileData,
  change
}: {
  eventsObj: any;
  services: ServiceRsDataType;
  userProfileData?:UserRsDataType
  onDateRangeChange: (start: Date, end: Date, viewMode: string) => void;
  provider_id: string;
  change:()=>void
}) {
  const initialEvents = useMemo(() => {
    return eventsObj || [];
  }, [eventsObj]);
  
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const {logout} = useLogout()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [selectedService, setSelectedService] = useState<serviceType | null>(
    null
  );
  const [currentView, setCurrentView] = useState<
    (typeof Views)[keyof typeof Views]
  >(() => {
    // Try to get the view from localStorage, default to DAY if not found
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("calendarView");
      return savedView
        ? (savedView as (typeof Views)[keyof typeof Views])
        : Views.DAY;
    }
    return Views.DAY;
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { mutate: deleteService } = useDeleteService();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const {mutate}=useUpdateTimeSlotDate()
  useEffect(() => {
    setEvents(eventsObj || []);
  }, [eventsObj]);



  const handleSelectSlot = useCallback((slotInfo: any) => {
   
    setSelectedSlot({
      start: new Date(slotInfo.start),
      end: new Date(slotInfo.end),
    });
    setIsModalOpen(true);
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

  const handleEventSubmit = useCallback(
    async (eventData: any) => {
      try {
        setEvents((prev) => {
          if (isEditMode && selectedEvent) {
            // Update existing event
            const updatedEvents = prev.map((event) =>
              event.id === selectedEvent.id ? { ...event, ...eventData } : event
            );
            return updatedEvents;
          } else {
            const newEvent = {
              id: prev.length + 1,
              ...eventData,
            };
            const updatedEvents = [...prev, newEvent];
            return updatedEvents;
          }
        });
        setSelectedService(null);
        setSelectedSlot(null);
        setIsEditMode(false);
      } catch (error) {}
    },
    [isEditMode, selectedEvent]
  );

  const moveEvent = useCallback(
    ({ event, start, end }: any) => {
 
      const typedEvent = event as any;
      setEvents((prev) => {
        const existing = prev.find((ev) => ev.id === typedEvent.id);
        if (!existing) return prev;
        const filtered = prev.filter((ev) => ev.id !== typedEvent.id);
        if(existing?.slotId){
          mutate({id: existing.slotId, start_time: start, end_time: end,phone:typedEvent.customerPhone,name:typedEvent.customerName}
            ,{
              onSuccess: (res) => {
                toast.success(res.message);
                  change()
                return [...filtered, { ...existing, start, end }];
              },
              onError: (error: any) => {
                toast.error(error?.message);
              }
            }
          )
        }
        return [];
      });
    },
    [setEvents]
  );

  const resizeEvent = useCallback(
    ({ event, start, end }: any) => {
      const typedEvent = event as any;
      setEvents((prev) => {
        const existing = prev.find((ev) => ev.id === typedEvent.id);
        if (!existing) return prev;
        const filtered = prev.filter((ev) => ev.id !== typedEvent.id);
      if(existing?.slotId){
        mutate({id: existing.slotId, start_time: start, end_time: end,phone:typedEvent.customerPhone,name:typedEvent.customerName}
          ,{
            onSuccess: (res) => {
              toast.success(res.message);
                change()
              return [...filtered, { ...existing, start, end }];
            },
            onError: (error: any) => {
              toast.error(error?.message);
            }
          }
        )
      }
       return []
      });
    },
    [setEvents]
  );

  const handleEventClick = useCallback((event: CalendarEvent) => {
    const typedEvent = event as Event;
    setSelectedEvent(typedEvent);
    setIsDetailsModalOpen(true);
  }, []);

  const eventStyleGetter = useCallback((event: any) => {
  
    return {
      style: {
        backgroundColor: event.color || "#4a90e2", 
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
        padding: "2px 4px",
        fontSize: "0.9em",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
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

  const handleDragStart = useCallback((service: serviceType) => {
    setSelectedService(service);
  }, []);

  const handleNavigate = useCallback(
    (newDate: Date) => {
      setCurrentDate(newDate);
      // Calculate the start and end of the current view
      let start = new Date(newDate);
      let end = new Date(newDate);

      // switch (currentView) {
      //   case Views.MONTH:
      //     start.setDate(1);
      //     end.setMonth(end.getMonth() + 1);
      //     end.setDate(0);
      //     break;
      //   case Views.WEEK:
      //     start.setDate(start.getDate() - start.getDay());
      //     end.setDate(start.getDate() + 6);
      //     break;
      //   case Views.DAY:
      //     // For day view, start and end are the same
      //     break;
      //   default:
      //     break;
      // }

      // Format dates to YYYY-MM-DD
      // const formatDate = (date: Date) => {
      //   const year = date.getFullYear();
      //   const month = String(date.getMonth() + 1).padStart(2, '0');
      //   const day = String(date.getDate()).padStart(2, '0');
      //   return `${year}-${month}-${day}`;
      // };

      onDateRangeChange(start, end, currentView);
    },
    [currentView, onDateRangeChange]
  );

  const handleViewChange = useCallback(
    (newView: (typeof Views)[keyof typeof Views]) => {
      setCurrentView(newView);
      // Save the view to localStorage
      // if (typeof window !== "undefined") {
      //   localStorage.setItem("calendarView", newView);
      // }
      // Recalculate date range when view changes
      handleNavigate(currentDate);
    },
    [currentDate, handleNavigate]
  );

  const components = {
    event: ({ event }: { event: CalendarEvent }) => {
      if (!event) return null;
      const typedEvent = event as Event;

      // Show more details in day view
      if (currentView === Views.DAY) {
        return (
          <div
            className="d-flex  justify-content align-items-center"
            style={{ padding: "4px" }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "2px" }}>
           {typedEvent.title} {typedEvent.customerName}{typedEvent.customerFamily}{typedEvent.description}
            </div>

          </div>
        );
      }

      // Simple display for other views
    //  return <div style={{ padding: "2px" }}>{typedEvent.title}</div>;
    },
  };

  const formats = {
    timeGutterFormat: "HH:mm", // 24-hour format (e.g., "08:00", "18:00")
    eventTimeRangeFormat: ({ start, end }: any, culture: any, localizer: any) =>
      `${localizer.format(start, "HH:mm", culture)} - ${localizer.format(
        end,
        "HH:mm",
        culture
      )}`,
  };

  const handleDeleteService = (serviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setServiceToDelete(serviceId);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = useCallback(async () => {
   
    if (serviceToDelete) {

     deleteService(serviceToDelete,{
      onSuccess(res) {
        toast.success("Dienst erfolgreich gelöscht")
        toast.success(res.message)
       setServiceToDelete(null);
     },onError(res){
      toast.error("Dieser Dienst konnte nicht gelöscht werden, da er Termine enthält")
      toast.error(res.message) 
    }
    },
  
  
  );

      setOpenDeleteModal(false);
      queryClient.invalidateQueries({ queryKey: ["services"] });
    }
  }, [deleteService, serviceToDelete, queryClient]);

  return (
    <>
      {/* Hamburger Menu Button */}

      <div className="calendar-container p-2 shadow">
       
          {/* SideBar Menu */}
          <section className={isSidebarOpen ? "sidebar" : "closed sidebar"}>
         
            <div
              className="services-list"
              style={{
                padding: "20px",
                paddingTop: "40px",
                maxHeight:'80vh',
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
           
              <Link href="/dashboard/users" className="btn"  style={{backgroundColor:"#ACD1AF", textDecoration: 'none' }}>
              Nue Kunde
              </Link>

              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setIsNewServiceModalOpen(true);
                }} 
                className="btn" 
                style={{backgroundColor:"#ACD1AF"}}
              >
                Nue Service
              </button>
              <button 
                className="btn" 
                onClick={() => {
                  setIsNewServiceModalOpen(false);
                  setIsModalOpen(true);
                }}  
                style={{backgroundColor:"#ACD1AF"}}
              >
                Nue Termin
              </button>
              <button 
                onClick={() => logout()} 
                className="btn btn-danger" 
                
              >
                logout
              </button>
              {Array.isArray(services) &&
                services.map((service) => (
                  <button
                    key={service.id}
                    className="btn position-relative"
                    style={{
                      backgroundColor: service.color,
                      fontSize: "10px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100px"
                    }}
                    title={service.title}
                    onClick={() => {
                      setSelectedService(service);
                      setIsModalOpen(true);
                    }}
                  >
                    {service.title.split(' ').length > 2 ? `${service.title.split(' ')[0]}${service.title.split(' ')[1]}...` : service.title}
                    <FaTimes
                      className="position-absolute"
                      style={{
                        right: "4px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        opacity: 0.8,
                        transition: "opacity 0.2s",
                      }}
                      onClick={(e) => {
                        handleDeleteService(service.id, e)}}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "0.8";
                      }}
                    />
                  </button>
                ))}
            
            </div>
      
          
          </section>
          {/* Main Calendar Area */}
          <main className="calendar-layout shadow">
          <section
            className={
              isSidebarOpen
                ? "maincontentcalenderopensidebar"
                : " maincontentcalender"
            }
          >
            <div className="d-flex align-items-center gap-2">

              <i
                style={{ fontSize: "1.4rem", cursor: "pointer" }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="bi bi-grid"
              ></i>
               <GermanDatePicker
              selected={currentDate}
              onChange={(date: Date | null) => {
                if (date) {
                  setCurrentDate(date);
                  handleNavigate(date);
                }
              }}
              minDate={new Date()}
              filterDate={(date: Date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date >= today;
              }}
            /> 
               <div className="h5">{userProfileData?.name}</div>
              
            </div>

            <DragAndDropCalendar
              localizer={localizer}
              defaultDate={new Date()}
              min={new Date(0, 0, 0, 8, 0, 0)} // 8:00 AM
              max={new Date(0, 0, 0, 20, 0, 0)} // 6:00 PM
              formats={formats}
              events={events}
              startAccessor={(event: any) => new Date(event.start)}
              endAccessor={(event: any) => new Date(event.end)}
              style={{ height: "90vh" }}
              view={"day"}
              date={currentDate}
              onNavigate={handleNavigate}
              onView={handleViewChange}
              views={["day"]}
              onEventDrop={moveEvent}
              onEventResize={resizeEvent}
              selectable
              onSelectSlot={handleSelectSlot}
              // onDropFromOutside={handleDropFromOutside}
              resizable
              step={30}
              timeslots={2}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleEventClick}
              popup
              messages={{
                next: "Weiter",
                previous: "Zurück",
                today: "Heute",
                //  month: "Monat",
                //   week: "Woche",
                //  day: "Tag",
                //   agenda: "Agenda",
                date: "Datum",
                time: "Zeit",
                event: "Termin",
                noEventsInRange: "Keine Termine in diesem Zeitraum.",
                //allDay: "Ganztägig",
              }}
              components={components}
              dayPropGetter={(date) => ({
                className:
                  date.getDay() === 0 || date.getDay() === 6
                    ? "weekend-day"
                    : "",
              })}
            />
          </section>
        </main>
      </div>
      <EventFormModal
        isOpen={isModalOpen || isNewServiceModalOpen}
        isNewServiceModal={isNewServiceModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsNewServiceModalOpen(false);
          setIsEditMode(false);
          setSelectedEvent(null);
        }}
        onSubmit={handleEventSubmit}
        selectedSlot={selectedSlot || undefined}
        selectedService={selectedService || undefined}
        services={services}
        provider_id={provider_id}
        initialData={
          isEditMode
            ? selectedEvent === null
              ? undefined
              : selectedEvent
            : undefined
        }
      />
      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={handleEditEvent}
        event={selectedEvent}
        onDelete={handleDeleteEvent}
      />

<SafeDeleteModal
     isOpen={openDeleteModal}
     onClose={() => setOpenDeleteModal(false)}
     onConfirm={handleConfirmDelete}
     title="Service löschen"
     message="Sind Sie sicher, dass Sie diesen Service löschen möchten?"
     confirmText="Löschen"
     cancelText="Abbrechen"
    />
    </>
  );
}
