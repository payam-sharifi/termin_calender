"use client";

import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { serviceType } from "@/services/servicesApi/Service.types";
import { useUpdateService } from "@/services/hooks/serviices/useUpdateService";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";

interface EditServiceModalProps {
  show: boolean;
  onHide: () => void;
  service: serviceType | null;
  onDelete: (service: serviceType) => void;
}

export default function EditServiceModal({
  show,
  onHide,
  service,
  onDelete,
}: EditServiceModalProps) {
  const [formData, setFormData] = useState<Partial<serviceType>>({});
  const { mutate: updateService, isPending } = useUpdateService();

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title,
        duration: service.duration,
        price: service.price,
        color: service.color,
        description: service.description,
        is_active: service.is_active,
      });
    }
  }, [service]);

  const handleInputChange = (field: keyof serviceType, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (service) {
      updateService(
        { id: service.id, data: formData },
        {
          onSuccess: (res: any) => {
            toast.success(res.message);
            // Small delay to ensure the query invalidation completes
            setTimeout(() => {
              onHide();
            }, 100);
          },
          onError: (error: any) => {
            toast.error("Fehler beim Aktualisieren des Dienstes.");
            console.error("Error updating service:", error);
          },
        }
      );
    }
  };

  if (!service) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Dienst bearbeiten</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Titel *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Anbieter</Form.Label>
                <Form.Control
                  type="text"
                  value={service.user?.name || '-'}
                  disabled
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Dauer (Minuten) *</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={formData.duration || ""}
                  onChange={(e) => handleInputChange("duration", parseInt(e.target.value))}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Preis (€)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price || ""}
                  onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Farbe</Form.Label>
                <Form.Control
                  type="color"
                  value={formData.color || "#4a90e2"}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Check
                  type="switch"
                  id="active-switch"
                  label="Aktiv"
                  checked={formData.is_active || false}
                  onChange={(e) => handleInputChange("is_active", e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Beschreibung</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => onDelete(service)}>
            Löschen
          </Button>
          <Button variant="secondary" onClick={onHide}>
            Abbrechen
          </Button>
          <Button variant="primary" type="submit" disabled={isPending}>
            {isPending ? "Speichern..." : "Speichern"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
} 