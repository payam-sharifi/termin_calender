/** Dispatched on `window` when a booking is created (e.g. chat) so dashboards can refetch calendar data. */
export const CALENDAR_APPOINTMENT_CREATED_EVENT = "termin:appointment-created";

export type CalendarAppointmentCreatedDetail = {
  providerId: string;
};
