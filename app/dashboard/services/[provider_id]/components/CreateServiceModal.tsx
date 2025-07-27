"use client";

import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { createNewService } from "@/services/servicesApi/Service.types";
import { useGetProvidersAndAdmins } from "@/services/hooks/user/useGetProvidersAndAdmins";
import { UserRsDataType } from "@/services/userApi/user.types";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface CreateServiceModalProps {
  show: boolean;
  onHide: () => void;
  newService: createNewService;
  onServiceChange: (service: createNewService) => void;
  onCreate: () => void;
}

export default function CreateServiceModal({
  show,
  onHide,
  newService,
  onServiceChange,
  onCreate,
}: CreateServiceModalProps) {
  const { data: providersAndAdmins, isLoading: isLoadingProviders } = useGetProvidersAndAdmins();

  // Set current user as default provider when modal opens
  useEffect(() => {
    if (show && !newService.provider_id) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('termin-token') : null;
      if (token) {
        try {
          const decoded = jwtDecode<{ id: string }>(token);
          handleInputChange("provider_id", decoded.id);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    }
  }, [show, newService.provider_id]);

  const handleInputChange = (field: keyof createNewService, value: any) => {
    onServiceChange({
      ...newService,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Neuen Dienst erstellen</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Titel *</Form.Label>
                <Form.Control
                  type="text"
                  value={newService.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Anbieter *</Form.Label>
                <Form.Select
                  value={newService.provider_id}
                  onChange={(e) => handleInputChange("provider_id", e.target.value)}
                  required
                  disabled={isLoadingProviders}
                >
                  <option value="">Anbieter auswählen...</option>
                  {providersAndAdmins?.map((user: UserRsDataType) => (
                    <option key={user.id} value={user.id}>
                      {user.name} {user.family} ({user.role})
                    </option>
                  ))}
                </Form.Select>
                {isLoadingProviders && (
                  <Form.Text className="text-muted">
                    Lade Anbieter...
                  </Form.Text>
                )}
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
                  value={newService.duration}
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
                  value={newService.price || ''}
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
                  value={newService.color}
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
                  checked={newService.is_active}
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
              value={newService.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Abbrechen
          </Button>
          <Button variant="primary" type="submit">
            Erstellen
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
} 