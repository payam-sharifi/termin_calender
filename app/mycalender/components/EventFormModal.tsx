"use client";

import { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ServiceRsDataType,
  serviceType,
} from "@/services/servicesApi/Service.types";
import { Event } from "../types/event";
import { useCreateTimeSlot } from "@/hooks/timeSlots/useCreateTimeSlot";

// interface Service {
//   id: number;
//   name: string;
//   color: string;
//   duration: number;
//   price: number;
//   providerName: string;
// }

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
  selectedSlot?: {
    start: Date;
    end: Date;
  };
  selectedService?: serviceType;
  services: serviceType[];
  initialData?: Event | null;
}

export default function EventFormModal({
  isOpen,
  onClose,
  onSubmit,
  selectedSlot,
  selectedService,
  services,
  initialData,
}: EventFormModalProps) {
  console.log("Services in EventFormModal:", services);
  const {
    mutate: CreateSlotApi,
    data,
    isError,
    isSuccess,
  } = useCreateTimeSlot();
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    start: Date;
    end: Date;
    service: serviceType;
    customerName: string;
    customerFamily: string;
    customerEmail: string;
    customerPhone: string;
  }>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    start: initialData?.start || selectedSlot?.start || new Date(),
    end: initialData?.end || selectedSlot?.end || new Date(),
    service: initialData?.service || selectedService || services[0],
    customerName: initialData?.customerName || "",
    customerFamily: initialData?.customerFamily || "",
    customerEmail: initialData?.customerEmail || "",
    customerPhone: initialData?.customerPhone || "",
  });

  useEffect(() => {
    if (selectedSlot) {
      setFormData((prev) => ({
        ...prev,
        start: selectedSlot.start,
        end: selectedSlot.end,
      }));
    }
    if (selectedService) {
      setFormData((prev) => ({
        ...prev,
        service: selectedService,
        title: selectedService.title,
      }));
    }
  }, [selectedSlot, selectedService]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
        start: new Date(initialData.start),
        end: new Date(initialData.end),
        service: initialData.service,
        customerName: initialData.customerName,
        customerFamily: initialData.customerFamily,
        customerEmail: initialData.customerEmail,
        customerPhone: initialData.customerPhone,
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //
    try {
      CreateSlotApi({
        start_time: formData.start.toISOString(),
        end_time: formData.end.toISOString(),
        service_id: formData.service.id,
        status: "Available",
      });
      console.log(data, "insussecc");
      if (data.statusCode == 201) {
        onSubmit(formData);
        onClose();
      }
    } catch (error) {}
  };

  const handleServiceChange = (serviceId: string) => {
    const service = services?.find((s) => s.id === serviceId);
    if (service) {
      setFormData((prev) => ({
        ...prev,
        service: service,
        title: service.title,
        end: new Date(prev.start.getTime() + service.duration * 60000),
      }));
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Neuer Termin</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Service</Form.Label>
                <Form.Select
                  value={formData.service?.id?.toString() || ""}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  required
                >
                  <option value="">Service auswählen</option>
                  {Array.isArray(services) && services.length > 0 ? (
                    services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.title} - ({service.price}€)
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Keine Services verfügbar
                    </option>
                  )}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Titel</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Startzeit</Form.Label>
                <DatePicker
                  selected={formData.start}
                  onChange={(date: Date | null) =>
                    date && setFormData({ ...formData, start: date })
                  }
                  showTimeSelect
                  dateFormat="Pp"
                  className="form-control"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Endzeit</Form.Label>
                <DatePicker
                  selected={formData.end}
                  onChange={(date: Date | null) =>
                    date && setFormData({ ...formData, end: date })
                  }
                  showTimeSelect
                  dateFormat="Pp"
                  className="form-control"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Vorname</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nachname</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.customerFamily}
                  onChange={(e) =>
                    setFormData({ ...formData, customerFamily: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>E-Mail</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Telefon</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Beschreibung</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Abbrechen
            </Button>
            <Button variant="primary" type="submit">
              Speichern
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
