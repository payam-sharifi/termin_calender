"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { de } from "date-fns/locale/de";
import {
  Container,
  Card,
  Form,
  Button,
  Table,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useGetUserTimeSlots } from "@/services/hooks/timeSlots/useGetUserTimeSlots";
import {
  getCalendarDayClassName,
  getCalendarWeekDayClassName,
} from "@/lib/calendarDayClassName";
import {
  dayEndIsoInAppTimezone,
  dayStartIsoInAppTimezone,
  formatAppDate,
  formatAppTime,
  todayYmdInAppTimezone,
} from "@/lib/appTimezone";

registerLocale("de", de);

function ymdToLocalDate(ymd: string): Date {
  if (!ymd) return new Date();
  const [y, m, day] = ymd.split("-").map((x) => parseInt(x, 10));
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(day))
    return new Date();
  return new Date(y, m - 1, day, 12, 0, 0, 0);
}

/** Opens react-datepicker in a centered overlay (native type="date" cannot be centered). */
function CenteredKundenDatePicker({
  id,
  label,
  valueYmd,
  onApply,
}: {
  id: string;
  label: string;
  valueYmd: string;
  onApply: (date: Date) => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const display =
    valueYmd.trim() !== ""
      ? ymdToLocalDate(valueYmd).toLocaleDateString("de-DE")
      : "Datum wählen";

  return (
    <>
      <div className="d-flex align-items-center gap-2 flex-shrink-0">
        <Form.Label htmlFor={id} className="mb-0 text-nowrap">
          {label}
        </Form.Label>
        <Button
          type="button"
          variant="outline-secondary"
          id={id}
          className="d-inline-flex align-items-center gap-2 text-start"
          style={{ minWidth: "10.5rem", maxWidth: "14rem" }}
          onClick={() => setOpen(true)}
        >
          <span className="text-truncate">{display}</span>
          <i className="bi bi-calendar3 flex-shrink-0" aria-hidden />
        </Button>
      </div>
      {open && (
        <div
          className="kunden-termin-datepicker-overlay"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="kunden-termin-datepicker-panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <DatePicker
              selected={ymdToLocalDate(valueYmd)}
              onChange={(date: Date | null) => {
                if (date) {
                  onApply(date);
                  setOpen(false);
                }
              }}
              inline
              locale="de"
              calendarStartDay={1}
              dayClassName={getCalendarDayClassName}
              weekDayClassName={getCalendarWeekDayClassName}
            />
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              className="w-100"
              onClick={() => setOpen(false)}
            >
              Schließen
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

/** First word of service title, max 5 letters + "..."; full title on hover / click. */
function ServiceDienstLabel({ appt }: { appt: any }) {
  const fullTitle =
    String(appt.service?.title ?? "").trim() || String(appt.service_id ?? "—");
  const firstWord = fullTitle.split(/\s+/).filter(Boolean)[0] || fullTitle;
  const short =
    firstWord.length > 5 ? `${firstWord.slice(0, 5)}...` : firstWord;

  return (
    <OverlayTrigger
      placement="top"
      delay={{ show: 200, hide: 150 }}
      trigger={["hover", "focus", "click"]}
      overlay={<Tooltip id={`dienst-tt-${appt.id}`}>{fullTitle}</Tooltip>}
    >
      <span
        className="fw-medium"
        style={{ cursor: "help" }}
        tabIndex={0}
        aria-label={fullTitle}
      >
        {short}
      </span>
    </OverlayTrigger>
  );
}

export default function UserAppointmentsPage({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const { user_id: userId } = use(params);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [customStart, setCustomStart] = useState<string>(""); // YYYY-MM-DD
  const [customEnd, setCustomEnd] = useState<string>(""); // YYYY-MM-DD
  const { data, isLoading } = useGetUserTimeSlots({
    user_id: userId,
    page,
    limit,
    start_time: startTime || undefined,
    end_time: endTime || undefined,
  });
  const resp: any = data || {};
  const items = resp.data || [];
  const pagination = resp.pagination;
  const nowIso = new Date().toISOString();
  const upcoming = items.filter((a: any) => a.start_time >= nowIso);
  const past = items.filter((a: any) => a.start_time < nowIso);

  const displayStart =
    customStart ||
    (startTime
      ? formatAppDate(startTime, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "");
  const displayEnd =
    customEnd ||
    (endTime
      ? formatAppDate(endTime, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "");

  const formatRowDate = (iso: string) =>
    formatAppDate(iso, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatRowTimeRange = (startIso: string, endIso: string) =>
    `${formatAppTime(startIso)} – ${formatAppTime(endIso)}`;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Link href="/dashboard/users" className="btn btn-outline-primary">
          Zurück
        </Link>
        <h3 className="mb-0">Kunden-Termine</h3>
        <span />
      </div>

      <Card className="mb-3 shadow">
        <Card.Body>
          {(displayStart || displayEnd) && (
            <div className="mb-2 text-muted">
              <strong>Filter:</strong> {displayStart || "—"} bis{" "}
              {displayEnd || "—"}
            </div>
          )}
          <div className="d-flex align-items-center flex-wrap gap-3 mb-3">
            <CenteredKundenDatePicker
              id="kunden-filter-start"
              label="Start (Datum)"
              valueYmd={customStart}
              onApply={(date) => {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const ymd = `${y}-${m}-${day}`;
                setCustomStart(ymd);
                setStartTime(dayStartIsoInAppTimezone(ymd));
                setPage(1);
              }}
            />
            <CenteredKundenDatePicker
              id="kunden-filter-ende"
              label="Ende (Datum)"
              valueYmd={customEnd}
              onApply={(date) => {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const ymd = `${y}-${m}-${day}`;
                setCustomEnd(ymd);
                setEndTime(dayEndIsoInAppTimezone(ymd));
                setPage(1);
              }}
            />
          </div>

          <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
            <Button
              variant="outline-primary"
              className="flex-shrink-0"
              onClick={() => {
                const todayYmd = todayYmdInAppTimezone();
                setStartTime(dayStartIsoInAppTimezone(todayYmd));
                setEndTime(dayEndIsoInAppTimezone(todayYmd));
                setCustomStart(todayYmd);
                setCustomEnd(todayYmd);
                setPage(1);
              }}
            >
              Heute
            </Button>
            <Button
              variant="outline-secondary"
              style={{ color: "#c5a059" }}
              className="flex-shrink-0"
              onClick={() => {
                setStartTime("");
                setEndTime("");
                setCustomStart("");
                setCustomEnd("");
                setPage(1);
              }}
            >
              Zurücksetzen
            </Button>
          </div>
        </Card.Body>
      </Card>

      {isLoading ? (
        <div>Laden...</div>
      ) : (
        <div className="d-grid gap-3">
          <Card className="shadow">
            <Card.Header className="fw-bold">Bevorstehende Termine</Card.Header>
            <Card.Body className="p-0">
              {upcoming.length === 0 ? (
                <div className="text-muted p-3">
                  Keine bevorstehenden Termine
                </div>
              ) : (
                <Table
                  striped
                  bordered
                  hover
                  responsive
                  className="mb-0 align-middle"
                >
                  <thead>
                    <tr>
                      <th scope="col">Datum</th>
                      <th scope="col">Zeit</th>
                      <th scope="col">Dienst</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcoming.map((appt: any) => (
                      <tr key={appt.id}>
                        <td>{formatRowDate(appt.start_time)}</td>
                        <td className="text-nowrap">
                          {formatRowTimeRange(appt.start_time, appt.end_time)}
                        </td>
                        <td>
                          <div className="d-flex flex-wrap align-items-center gap-2">
                            <span
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                backgroundColor: appt?.service?.color || "#999",
                                flexShrink: 0,
                                border: "2px solid rgba(255,255,255,0.35)",
                              }}
                              aria-hidden
                            />
                            <ServiceDienstLabel appt={appt} />
                          </div>
                          {appt.desc && (
                            <div className="small text-muted mt-1">
                              {appt.desc}
                            </div>
                          )}
                          {appt.notes && (
                            <div className="small mt-1">{appt.notes}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          <Card className="shadow">
            <Card.Header className="fw-bold">Vergangene Termine</Card.Header>
            <Card.Body className="p-0">
              {past.length === 0 ? (
                <div className="text-muted p-3">Keine vergangenen Termine</div>
              ) : (
                <Table
                  striped
                  bordered
                  hover
                  responsive
                  className="mb-0 align-middle"
                >
                  <thead>
                    <tr>
                      <th scope="col">Datum</th>
                      <th scope="col">Zeit</th>
                      <th scope="col">Dienst</th>
                    </tr>
                  </thead>
                  <tbody>
                    {past.map((appt: any) => (
                      <tr key={appt.id}>
                        <td>{formatRowDate(appt.start_time)}</td>
                        <td className="text-nowrap">
                          {formatRowTimeRange(appt.start_time, appt.end_time)}
                        </td>
                        <td>
                          <div className="d-flex flex-wrap align-items-center gap-2">
                            <span
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                backgroundColor: appt?.service?.color || "#999",
                                flexShrink: 0,
                                border: "2px solid rgba(255,255,255,0.35)",
                              }}
                              aria-hidden
                            />
                            <ServiceDienstLabel appt={appt} />
                          </div>
                          {appt.desc && (
                            <div className="small text-muted mt-1">
                              {appt.desc}
                            </div>
                          )}
                          {appt.notes && (
                            <div className="small mt-1">{appt.notes}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </div>
      )}
      {pagination && (
        <div className="d-flex justify-content-center align-items-center mt-3">
          <button
            className="btn btn-secondary"
            disabled={!pagination.hasPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="mx-3">
            Page {pagination.page} / {pagination.pages}
          </span>
          <button
            className="btn btn-secondary"
            disabled={!pagination.hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </Container>
  );
}
