import { Event, stringOrDate } from 'react-big-calendar'
import importedEvents from "@/resources/events"

export interface CustomEvent extends Event {
    id: number;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    desc?: string;
    isDraggable: boolean;
  }

  export interface DropEvent {
    start: Date | string;
    end: Date | string;
    allDay: boolean;
  }
  
  export interface DraggedEventType {
    title: string;
    name: string;
  }
  export const adjEvents = importedEvents.map((it, ind) => ({
    ...it,
    isDraggable: ind % 2 === 0,
  }))