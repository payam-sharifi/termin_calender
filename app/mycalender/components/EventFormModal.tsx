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
import { useGetUsers } from "@/services/hooks/user/useGetUsers";
import { toast } from "react-toastify";

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
  isNewServiceModal?: boolean;
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
  isNewServiceModal = false,
}: EventFormModalProps) {
  const queryClient = useQueryClient();
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  
  const { data: customersList, isLoading } = useGetUsers(searchTerm, 5, currentPage, "Customer");

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
    customer_id: string;
    sex: string;
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
    customer_id: initialData?.customer_id || "",
    sex: initialData?.sex || "",
  });

  const [isNewServiceModalOpen, setIsNewServiceModalOpen] =
    useState(isNewServiceModal);
  const [newServiceFormData, setNewServiceFormData] =
    useState<createNewService>({
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

  const [serviceWarning, setServiceWarning] = useState<boolean>(false);
  const [serviceDuration, setServiceDuration] = useState<number>(initialData?.service.duration||90);
  // duration
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
    } else if (services && services.length > 0) {
      // Set first service as default if no service is selected
      setFormData((prev) => ({
        ...prev,
        service: services[0],
        title: services[0].title,
      }));
    }
  }, [selectedSlot, selectedService, services, setFormData]);

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
        customer_id: initialData.customer_id || "",
        sex: initialData.sex || "",
      });
    }
  }, [initialData]);

  // Update provider_id when it changes
  useEffect(() => {
    setNewServiceFormData((prev) => ({
      ...prev,
      provider_id: provider_id,
    }));
  }, [provider_id]);

  useEffect(() => {
    if (createdServiceData) {
      console.log("Service created with response:", createdServiceData);
    }
  }, [createdServiceData]);

  useEffect(() => {
    setIsNewServiceModalOpen(isNewServiceModal);
  }, [isNewServiceModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
console.log(formData,"formData")
    try {
CreateSlotApi({
    name:formData.customerName,
    family:formData.customerFamily,
    email:formData.customerEmail,
    phone:formData.customerPhone,
    customer_id:formData.customer_id,
    start_time: formData.start.toISOString(),
    end_time: formData.end.toISOString(),
    service_id: formData.service.id,
    sex:formData.sex,
    status: "Available",
  },
  {
    onSuccess: (res) => {
      toast.success(res.message);
      onSubmit(formData);
        onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message);
     
    }
  }

);
      
      
    } catch (error) {console.log(error)}
  };

  const handleServiceChange = (serviceId: string) => {
    const service = services?.find((s) => s.id === serviceId);
    if (service) {
      setServiceWarning(true);
      const startTime = formData.start;
      const endTime = new Date(startTime.getTime() + service.duration * 60000);
      
      setFormData((prev) => ({
        ...prev,
        service: service,
        title: service.title,
        end: endTime,
      }));
      setServiceDuration(service.duration)
   
    }
  };

  const handleCreateNewService = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting service with color:", newServiceFormData.color);
    createNewServiceMutation(newServiceFormData, {
      onSuccess: (res) => {
        toast.success(res.message);
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
        toast.error(error.message);
        console.error("Error creating service:", error);
      },
    });
  };

  const handleCustomerSelect = (customer: any) => {
    setFormData((prev) => ({
      ...prev,
      customerName: customer.name ,
      customerFamily: customer.family ,
      customerEmail: customer.email ,
      customerPhone: customer.phone ,
      customer_id: customer.id ,
      sex: customer.sex || "",
    }));
    setShowCustomerModal(false);
    setSearchTerm("");
    setCurrentPage(1);
    setAllCustomers([]);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
    setAllCustomers([]);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Update allCustomers when new data arrives
  useEffect(() => {
    if (customersList?.data) {
      if (currentPage === 1) {
        setAllCustomers(customersList.data);
      } else {
        setAllCustomers(prev => [...prev, ...customersList.data]);
      }
      
      // Check if we have more data
      setHasMore(customersList.data.length === 10);
    }
  }, [customersList?.data, currentPage]);

  const filteredCustomers = allCustomers.filter((customer) =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.family?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <Modal show={isOpen} onHide={onClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {isNewServiceModal ? "Neuer Service" : "Neuer Termin"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <style>{customStyles}</style>
          {isNewServiceModal ? (
            <Form onSubmit={handleCreateNewService}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Titel</Form.Label>
                    <Form.Control
                      type="text"
                      value={newServiceFormData.title}
                      onChange={(e) =>
                        setNewServiceFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dauer (Minuten)</Form.Label>
                    <Form.Control
                      type="number"
                      value={newServiceFormData.duration}
                      onChange={(e) =>
                        setNewServiceFormData((prev) => ({
                          ...prev,
                          duration: parseInt(e.target.value),
                        }))
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Preis</Form.Label>
                    <Form.Control
                      type="number"
                      value={newServiceFormData.price || 0}
                      onChange={(e) =>
                        setNewServiceFormData((prev) => ({
                          ...prev,
                          price: parseFloat(e.target.value) || 0,
                        }))
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Farbe</Form.Label>
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          width: "100%",
                          height: "38px",
                          backgroundColor: newServiceFormData.color,
                          border: "1px solid #ced4da",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                      />
                      {showColorPicker && (
                        <div
                          style={{
                            position: "absolute",
                            zIndex: 2,
                            top: "100%",
                            left: 0,
                            marginTop: "4px",
                          }}
                        >
                          <div
                            style={{
                              position: "fixed",
                              top: 0,
                              right: 0,
                              bottom: 0,
                              left: 0,
                            }}
                            onClick={() => setShowColorPicker(false)}
                          />
                          <ChromePicker
                            color={newServiceFormData.color}
                            onChange={(color: ColorResult) =>
                              setNewServiceFormData((prev) => ({
                                ...prev,
                                color: color.hex,
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Beschreibung</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newServiceFormData.description}
                  onChange={(e) =>
                    setNewServiceFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </Form.Group>
              {/* <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={onClose}>
                  Abbrechen
                </Button>
                <Button variant="primary" type="submit">
                  Service erstellen
                </Button>
              </div> */}
            </Form>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Service</Form.Label>
                    <Form.Select
                      value={formData.service?.id}
                      onChange={(e) => handleServiceChange(e.target.value)}
                      required
                    >
                      {Array.isArray(services) && services.length > 0 ? (
                        services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.title}
                          </option>
                        ))
                      ) : (
                        <option disabled>Keine Services verfügbar</option>
                      )}
                    </Form.Select>
                    {serviceWarning && (
                      <div className="text-danger  mt-2 small" style={{height:"30px",width:"auto"}}>
                        Dieser Service dauert {serviceDuration} Minuten.
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  {/* <Form.Group className="mb-3">
                    <Form.Label>Titel</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      required
                    />
                  </Form.Group> */}
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Startzeit</Form.Label>
                    <DatePicker
                      selected={formData.start}
                      onChange={(date: Date | null) =>
                        date &&
                        setFormData((prev) => ({ ...prev, start: date }))
                      }
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd.MM.yyyy HH:mm"
                      className="form-control"
                      filterDate={(date) =>
                        !isWeekend(date) && !isPastDate(date)
                      }
                      dayClassName={dayClassName}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Endzeit</Form.Label>
                    <DatePicker
                      selected={formData.end}
                      onChange={(date: Date | null) =>
                        date && setFormData((prev) => ({ ...prev, end: date }))
                      }
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd.MM.yyyy HH:mm"
                      className="form-control"
                      filterDate={(date) =>
                        !isWeekend(date) && !isPastDate(date)
                      }
                      dayClassName={dayClassName}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vorname</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="text"
                        value={formData.customerName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            customerName: e.target.value,
                          }))
                        }
                        required
                      />
                      <Button
                        variant="outline-primary"
                        onClick={() => setShowCustomerModal(true)}
                        style={{ width: "40px" }}
                      >
                        +
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nachname</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.customerFamily}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerFamily: e.target.value,
                        }))
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
                        setFormData((prev) => ({
                          ...prev,
                          customerEmail: e.target.value,
                        }))
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
                        setFormData((prev) => ({
                          ...prev,
                          customerPhone: e.target.value,
                        }))
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Geschlecht</Form.Label>
                    <Form.Select
                      value={formData.sex}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sex: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Bitte wählen</option>
                      <option value="male">Männlich</option>
                      <option value="female">Weiblich</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Beschreibung</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              {/* <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={onClose}>
                  Abbrechen
                </Button>
                <Button variant="primary" type="submit">
                  Termin erstellen
                </Button>
              </div> */}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            variant="primary"
            onClick={isNewServiceModalOpen ? handleCreateNewService : handleSubmit}
          >
            {isNewServiceModalOpen ? "Service erstellen" : "Termin erstellen"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Customer Selection Modal */}
      <Modal show={showCustomerModal} onHide={() => setShowCustomerModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Kunde auswählen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoading ? (
            <div>Laden...</div>
          ) : (
            <div>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Suche nach Name, E-Mail oder Telefon..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <div 
                className="list-group" 
                style={{ maxHeight: '400px', overflowY: 'auto' }}
                onScroll={handleScroll}
              >
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    className="list-group-item list-group-item-action"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{customer.name} {customer.family}</strong>
                        <div className="text-muted small">
                          {customer.email} - {customer.phone}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                {filteredCustomers.length === 0 && searchTerm && (
                  <div className="text-center text-muted p-3">
                    Keine Kunden gefunden
                  </div>
                )}
                {hasMore && currentPage > 1 && isLoading && (
                  <div className="text-center p-3">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Laden...</span>
                    </div>
                    <span className="ms-2">Weitere Kunden laden...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCustomerModal(false)}>
            Schließen
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
