"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container, Card, Form, Button } from "react-bootstrap";
import { useGetUserTimeSlots } from "@/services/hooks/timeSlots/useGetUserTimeSlots";

export default function UserAppointmentsPage({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const resolved = useMemo(() => params, [params]);
  // Using a client component; unwrap the param via useMemo to avoid re-renders
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const userId = (resolved as any).user_id as string;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [customStart, setCustomStart] = useState<string>(""); // YYYY-MM-DD
  const [customEnd, setCustomEnd] = useState<string>("");   // YYYY-MM-DD
  const { data, isLoading } = useGetUserTimeSlots({ user_id: userId, page, limit, start_time: startTime || undefined, end_time: endTime || undefined });
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
  const displayStart = customStart || (startTime ? formatDateInput(new Date(startTime)) : "");
  const displayEnd = customEnd || (endTime ? formatDateInput(new Date(endTime)) : "");

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
              <strong>Filter:</strong> {displayStart || "—"} bis {displayEnd || "—"}
            </div>
          )}
          <div className="d-flex flex-wrap gap-2 mb-3">
            {(() => {
              const formatDateInput = (d: Date) => {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return `${y}-${m}-${day}`;
              };
              return null;
            })()}
            <Button
              variant="outline-primary"
              onClick={() => {
                const today = new Date();
                const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
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
              variant="outline-primary"
              onClick={() => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const endDate = new Date(start);
                endDate.setDate(endDate.getDate() + 6);
                const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
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
              Nächste 7 Tage
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
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
              Dieser Monat
            </Button>
            <Button
              variant="outline-secondary"
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

          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <Form.Label>Start (Datum)</Form.Label>
              <Form.Control
                type="date"
                value={customStart}
                onChange={(e) => {
                  const v = e.target.value;
                  setCustomStart(v);
                  if (v) {
                    const [y, m, day] = v.split("-").map((x) => parseInt(x, 10));
                    const dt = new Date(y, m - 1, day, 0, 0, 0, 0);
                    setStartTime(dt.toISOString());
                    setPage(1);
                  } else {
                    setStartTime("");
                  }
                }}
              />
            </div>
            <div className="col-md-4">
              <Form.Label>Ende (Datum)</Form.Label>
              <Form.Control
                type="date"
                value={customEnd}
                onChange={(e) => {
                  const v = e.target.value;
                  setCustomEnd(v);
                  if (v) {
                    const [y, m, day] = v.split("-").map((x) => parseInt(x, 10));
                    const dt = new Date(y, m - 1, day, 23, 59, 59, 999);
                    setEndTime(dt.toISOString());
                    setPage(1);
                  } else {
                    setEndTime("");
                  }
                }}
              />
            </div>
            <div className="col-md-4 d-flex gap-2 align-items-end"></div>
          </div>
        </Card.Body>
      </Card>

      {isLoading ? (
        <div>Laden...</div>
      ) : (
        <div className="d-grid gap-3">
          <Card className="shadow">
            <Card.Header className="fw-bold">Bevorstehende Termine</Card.Header>
            <Card.Body>
              {upcoming.length === 0 ? (
                <div className="text-muted">Keine bevorstehenden Termine</div>
              ) : (
                <div className="list-group">
                  {upcoming.map((appt: any) => (
                    <div key={appt.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold">
                            {new Date(appt.start_time).toLocaleString()} - {new Date(appt.end_time).toLocaleTimeString()}
                          </div>
                          <div className="text-muted small d-flex align-items-center" style={{ gap: 8 }}>
                            <span
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                backgroundColor: appt?.service?.color || "#999",
                                display: "inline-block",
                                border: "2px solid #fff",
                              }}
                            />
                            <span>{appt.service?.title || appt.service_id}</span>
                          </div>
                          {appt.desc && (
                            <div className="small mt-1">{appt.desc}</div>
                          )}
                        </div>
                        <span className="badge text-bg-info">{appt.status}</span>
                      </div>
                      {appt.notes && <div className="small mt-1">{appt.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="shadow">
            <Card.Header className="fw-bold">Vergangene Termine</Card.Header>
            <Card.Body>
              {past.length === 0 ? (
                <div className="text-muted">Keine vergangenen Termine</div>
              ) : (
                <div className="list-group">
                  {past.map((appt: any) => (
                    <div key={appt.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold">
                            {new Date(appt.start_time).toLocaleString()} - {new Date(appt.end_time).toLocaleTimeString()}
                          </div>
                          <div className="text-muted small d-flex align-items-center" style={{ gap: 8 }}>
                            <span
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                backgroundColor: appt?.service?.color || "#999",
                                display: "inline-block",
                                border: "2px solid #fff",
                              }}
                            />
                            <span>{appt.service?.title || appt.service_id}</span>
                          </div>
                          {appt.desc && (
                            <div className="small mt-1">{appt.desc}</div>
                          )}
                        </div>
                        <span className="badge text-bg-secondary">{appt.status}</span>
                      </div>
                      {appt.notes && <div className="small mt-1">{appt.notes}</div>}
                    </div>
                  ))}
                </div>
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
          <span className="mx-3">Page {pagination.page} / {pagination.pages}</span>
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


