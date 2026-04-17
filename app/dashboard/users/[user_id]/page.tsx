"use client";

import { use, useState } from "react";
import Link from "next/link";
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

  const formatDateInput = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const displayStart =
    customStart || (startTime ? formatDateInput(new Date(startTime)) : "");
  const displayEnd =
    customEnd || (endTime ? formatDateInput(new Date(endTime)) : "");

  const formatRowDate = (iso: string) =>
    new Date(iso).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatRowTimeRange = (startIso: string, endIso: string) => {
    const start = new Date(startIso);
    const end = new Date(endIso);
    const opts: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return `${start.toLocaleTimeString("de-DE", opts)} – ${end.toLocaleTimeString("de-DE", opts)}`;
  };

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
            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              <Form.Label className="mb-0 text-nowrap">
                Start (Datum)
              </Form.Label>
              <Form.Control
                type="date"
                style={{ maxWidth: "12rem" }}
                value={customStart}
                onChange={(e) => {
                  const v = e.target.value;
                  setCustomStart(v);
                  if (v) {
                    const [y, m, day] = v
                      .split("-")
                      .map((x) => parseInt(x, 10));
                    const dt = new Date(y, m - 1, day, 0, 0, 0, 0);
                    setStartTime(dt.toISOString());
                    setPage(1);
                  } else {
                    setStartTime("");
                  }
                }}
              />
            </div>
            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              <Form.Label className="mb-0 text-nowrap">Ende (Datum)</Form.Label>
              <Form.Control
                type="date"
                style={{ maxWidth: "12rem" }}
                value={customEnd}
                onChange={(e) => {
                  const v = e.target.value;
                  setCustomEnd(v);
                  if (v) {
                    const [y, m, day] = v
                      .split("-")
                      .map((x) => parseInt(x, 10));
                    const dt = new Date(y, m - 1, day, 23, 59, 59, 999);
                    setEndTime(dt.toISOString());
                    setPage(1);
                  } else {
                    setEndTime("");
                  }
                }}
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Button
              variant="outline-primary"
              className="flex-shrink-0"
              onClick={() => {
                const today = new Date();
                const start = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate(),
                );
                const end = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate(),
                  23,
                  59,
                  59,
                  999,
                );
                setStartTime(start.toISOString());
                setEndTime(end.toISOString());
                const formatDateInput = (d: Date) => {
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, "0");
                  const day = String(d.getDate()).padStart(2, "0");
                  return `${y}-${m}-${day}`;
                };
                setCustomStart(formatDateInput(start));
                setCustomEnd(formatDateInput(end));
                setPage(1);
              }}
            >
              Heute
            </Button>
            <Button
              variant="outline-secondary"
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
