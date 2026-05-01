"use client";

import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { createNewService } from "@/services/servicesApi/Service.types";
import { useGetProvidersAndAdmins } from "@/services/hooks/user/useGetProvidersAndAdmins";
import { useGetOneUser } from "@/services/hooks/user/useGetOneuser";
import { UserRsDataType } from "@/services/userApi/user.types";
import { useEffect, type Dispatch, type SetStateAction } from "react";

interface CreateServiceModalProps {
  show: boolean;
  onHide: () => void;
  newService: createNewService;
  onServiceChange: Dispatch<SetStateAction<createNewService>>;
  onCreate: () => void;
  /** When set, Anbieter is fixed to this provider (no full directory dropdown). */
  scopedProviderId?: string;
}

export default function CreateServiceModal({
  show,
  onHide,
  newService,
  onServiceChange,
  onCreate,
  scopedProviderId,
}: CreateServiceModalProps) {
  const isScoped = Boolean(scopedProviderId);
  const { data: providersAndAdmins, isLoading: isLoadingProviders } = useGetProvidersAndAdmins({
    enabled: !isScoped,
  });
  const { data: scopedProviderRes, isLoading: isLoadingScopedProvider } = useGetOneUser({
    id: scopedProviderId ?? "",
  });

  useEffect(() => {
    if (!show || !scopedProviderId) return;
    onServiceChange((prev) =>
      prev.provider_id === scopedProviderId ? prev : { ...prev, provider_id: scopedProviderId },
    );
  }, [show, scopedProviderId, onServiceChange]);

  const handleInputChange = (field: keyof createNewService, value: any) => {
    onServiceChange((prev) => ({
      ...prev,
      [field]: value,
    }));
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
                {isScoped ? (
                  <>
                    <Form.Control
                      type="text"
                      readOnly
                      disabled
                      value={
                        isLoadingScopedProvider
                          ? "Laden…"
                          : [scopedProviderRes?.data?.name, scopedProviderRes?.data?.family]
                              .filter(Boolean)
                              .join(" ") || scopedProviderId
                      }
                    />
                    <Form.Text className="text-muted">
                      Dienst wird für den Anbieter dieser Seite erstellt.
                    </Form.Text>
                  </>
                ) : (
                  <>
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
                      <Form.Text className="text-muted">Lade Anbieter...</Form.Text>
                    )}
                  </>
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

          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-3">
            <div className="d-flex align-items-center gap-2">
              <Form.Label className="mb-0">Farbe</Form.Label>
              <Form.Control
                type="color"
                value={newService.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
                title="Farbe wählen"
                style={{ width: "3rem", height: "2.5rem", cursor: "pointer", padding: 2 }}
              />
            </div>
            <div className="d-flex align-items-center gap-3">
              <Form.Label className="mb-0">Status</Form.Label>
              <Form.Check
                type="switch"
                id="active-switch-create-service"
                label="Aktiv"
                checked={newService.is_active}
                onChange={(e) => handleInputChange("is_active", e.target.checked)}
                className="mb-0"
              />
            </div>
          </div>

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