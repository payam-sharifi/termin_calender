"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container, Card } from "react-bootstrap";
import { useGetAllAppintmentsByDateAndUserId } from "@/services/hooks/appointments/useGetAppintments";

export default function UserAppointmentsPage({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const resolved = useMemo(() => params, [params]);
  // Using a client component; unwrap the param via useMemo to avoid re-renders
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const userId = (resolved as any).user_id as string;

  const nowIso = new Date().toISOString();
  const { data, isLoading } = useGetAllAppintmentsByDateAndUserId({ userId });

  const appointments = data?.data || [];
  const upcoming = appointments.filter((a: any) => a.start_time >= nowIso);
  const past = appointments.filter((a: any) => a.start_time < nowIso);

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Link href="/dashboard/users" className="btn btn-outline-primary">
          Zurück
        </Link>
        <h3 className="mb-0">Kunden-Termine</h3>
        <span />
      </div>

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
                          <div className="text-muted small">Service: {appt.service?.title || appt.service_id}</div>
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
                          <div className="text-muted small">Service: {appt.service?.title || appt.service_id}</div>
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
    </Container>
  );
}


