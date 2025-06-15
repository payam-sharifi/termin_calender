"use client";

import { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ServiceRsDataType,
  serviceType,
  createNewService,
} from "@/services/servicesApi/Service.types";
import { Event } from "../types/event";
import { useCreateTimeSlot } from "@/services/hooks/timeSlots/useCreateTimeSlot";
import { useCreateNewService } from "@/services/hooks/serviices/useCreateNewService";
import { ChromePicker, ColorResult } from "react-color";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import "moment/locale/de";

moment.locale("de");

// Add custom styles for weekend days
const customStyles = `
  .weekend-day {
    color: red !important;
  }
  .react-datepicker__day--weekend {
    color: red !important;
  }
  .react-datepicker__day--disabled {
    color: #ccc !important;
  }
`;

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
  provider_id: string;
}

export default function EventFormModal({
  isOpen,
  onClose,
  onSubmit,
  selectedSlot,
  selectedService,
  services,
  initialData,
  provider_id,
}: EventFormModalProps) {
  const queryClient = useQueryClient();
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

  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [newServiceFormData, setNewServiceFormData] = useState<createNewService>({
    provider_id: provider_id,
    title: "",
    duration: 30,
    is_active: true,
    price: 0,
    color: "#000000",
    description: "",
  });
  const [showColorPicker, setShowColorPicker] = useState(false);

  const {
    mutate: createNewServiceMutation,
    data: createdServiceData,
    isError: isNewServiceError,
    isSuccess: isNewServiceSuccess,
  } = useCreateNewService();

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

  // Update provider_id when it changes
  useEffect(() => {
    setNewServiceFormData(prev => ({
      ...prev,
      provider_id: provider_id
    }));
  }, [provider_id]);

  useEffect(() => {
    if (createdServiceData) {
      console.log('Service created with response:', createdServiceData);
    }
  }, [createdServiceData]);

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

  const handleCreateNewService = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting service with color:', newServiceFormData.color);
    createNewServiceMutation(newServiceFormData, {
      onSuccess: (data) => {
        console.log('Service created successfully:', data);
        // Invalidate and refetch services
        queryClient.invalidateQueries({ queryKey: ["getServices"] });
        setIsNewServiceModalOpen(false);
        // Reset form
        setNewServiceFormData({
          provider_id: provider_id,
          title: "",
          duration: 30,
          is_active: true,
          price: 0,
          color: "#000000",
          description: "",
        });
      },
      onError: (error) => {
        console.error('Error creating service:', error);
      }
    });
  };

  // Function to check if a date is a weekend
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  // Function to check if a date is in the past
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Custom day class for DatePicker
  const dayClassName = (date: Date) => {
    if (isWeekend(date)) {
      return "weekend-day";
    }
    return "";
  };

  return (
    <>
      <style>{customStyles}</style>
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
                  <div className="d-flex gap-2">
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
                    <Button
                      variant="outline-primary"
                      onClick={() => setIsNewServiceModalOpen(true)}
                    >
                      +
                    </Button>
                  </div>
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
                    className="form-control"
                    minDate={new Date()}
                    filterDate={(date) => !isPastDate(date)}
                    dayClassName={dayClassName}
                    locale="de"
                    timeIntervals={30}
                    timeCaption="Zeit"
                    dateFormat="dd.MM.yyyy HH:mm"
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
                    className="form-control"
                    minDate={formData.start}
                    filterDate={(date) => !isPastDate(date)}
                    dayClassName={dayClassName}
                    locale="de"
                    timeIntervals={30}
                    timeCaption="Zeit"
                    dateFormat="dd.MM.yyyy HH:mm"
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

      {/* New Service Modal */}
      <Modal
        show={isNewServiceModalOpen}
        onHide={() => setIsNewServiceModalOpen(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Neuer Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateNewService}>
            <Form.Group className="mb-3">
              <Form.Label>Titel</Form.Label>
              <Form.Control
                type="text"
                value={newServiceFormData.title}
                onChange={(e) =>
                  setNewServiceFormData({ ...newServiceFormData, title: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Dauer (Minuten)</Form.Label>
              <Form.Control
                type="number"
                value={newServiceFormData.duration}
                onChange={(e) =>
                  setNewServiceFormData({
                    ...newServiceFormData,
                    duration: parseInt(e.target.value),
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Preis (€)</Form.Label>
              <Form.Control
                type="number"
                value={newServiceFormData.price}
                onChange={(e) =>
                  setNewServiceFormData({
                    ...newServiceFormData,
                    price: parseFloat(e.target.value),
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Farbe</Form.Label>
              <div className="d-flex gap-2 align-items-center position-relative">
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: newServiceFormData.color,
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                {showColorPicker && (
                  <>
                    <div
                      style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1,
                      }}
                      onClick={() => setShowColorPicker(false)}
                    />
                    <div style={{ position: "absolute", zIndex: 2, top: "100%", left: 0 }}>
                      <ChromePicker
                        color={newServiceFormData.color}
                        onChange={(color: ColorResult) => {
                          console.log('Color selected:', color.hex);
                          setNewServiceFormData({
                            ...newServiceFormData,
                            color: color.hex,
                          });
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Beschreibung</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newServiceFormData.description}
                onChange={(e) =>
                  setNewServiceFormData({
                    ...newServiceFormData,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsNewServiceModalOpen(false)}
              >
                Abbrechen
              </Button>
              <Button variant="primary" type="submit">
                Speichern
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
