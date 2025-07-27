"use client";

import { Table, Button } from "react-bootstrap";
import { serviceType } from "@/services/servicesApi/Service.types";

interface ServicesTableProps {
  services: serviceType[];
  isLoading: boolean;
  page: number;
  limit: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  onEdit: (service: serviceType) => void;
}

export default function ServicesTable({
  services,
  isLoading,
  page,
  limit,
  totalCount,
  onPageChange,
  onEdit,
}: ServicesTableProps) {
  if (isLoading) {
    return <div>Laden...</div>;
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <>
      <div className="shadow">
        <Table striped bordered hover responsive style={{ marginBottom: 0 }}>
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Titel</th>
              <th style={{ width: '15%' }}>Anbieter</th>
              <th style={{ width: '10%' }}>Dauer (Min)</th>
              <th style={{ width: '10%' }}>Preis (€)</th>
              <th style={{ width: '20%' }}>Beschreibung</th>
              <th style={{ width: '10%' }}>Status</th>
              <th style={{ width: '10%' }}>Farbe</th>
              <th style={{ width: '10%' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {services?.map((service: serviceType) => (
              <tr key={service.id}>
                <td style={{ width: '15%' }}>{service.title}</td>
                <td style={{ width: '15%' }}>{service.user?.name || '-'}</td>
                <td style={{ width: '10%' }}>{service.duration}</td>
                <td style={{ width: '10%' }}>{service.price}</td>
                <td style={{ width: '20%' }}>{service.description || '-'}</td>
                <td style={{ width: '10%' }}>
                  <span className={`badge ${service.is_active ? 'bg-success' : 'bg-secondary'}`}>
                    {service.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </td>
                <td style={{ width: '10%' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: service.color,
                      borderRadius: '4px',
                      border: '1px solid #ccc'
                    }}
                    title={service.color}
                  />
                </td>
                <td style={{ width: '10%' }}>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onEdit(service)}
                  >
                    Bearbeiten
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="d-flex justify-content-center align-items-center mt-3">
        <Button
          variant="secondary"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Prev
        </Button>
        <span className="mx-3">Page {page} of {totalPages}</span>
        <Button
          variant="secondary"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </>
  );
} 