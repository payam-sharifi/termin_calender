"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { UserRsDataType, ROLE, SEX } from "@/services/userApi/user.types";

interface EditUserModalProps {
  show: boolean;
  onHide: () => void;
  user: UserRsDataType | null;
  onDelete: (user: UserRsDataType) => void;
  onSave?: (user: UserRsDataType) => void;
}

export default function EditUserModal({
  show,
  onHide,
  user,
  onDelete,
  onSave,
}: EditUserModalProps) {
  const [editUser, setEditUser] = useState<UserRsDataType | null>(user);
  const [errors, setErrors] = useState<Partial<Record<keyof UserRsDataType, string>>>({});

  useEffect(() => {
    if (show && user) {
      let phone = user.phone || "";
      if (!phone.startsWith("+49")) {
        phone = "+49";
      }
      setEditUser({ ...user, phone });
      setErrors({});
    }
  }, [show, user]);

  if (!editUser) return null;

  const handleFieldChange = (field: keyof UserRsDataType, value: any) => {
    setEditUser(prev => prev ? { ...prev, [field]: value } : prev);
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhoneChange = (value: string) => {
    let val = value.replace(/^0+/, "");
    if (!val.startsWith("+49")) {
      val = "+49" + val.replace(/^\+*/, "");
    }
    handleFieldChange("phone", val);
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof UserRsDataType, string>> = {};
    if (!editUser?.name) newErrors.name = "Name ist erforderlich.";
    if (!editUser?.family) newErrors.family = "Nachname ist erforderlich.";
    if (!editUser?.email) {
      newErrors.email = "E-Mail ist erforderlich.";
    } else if (!/\S+@\S+\.\S+/.test(editUser.email)) {
      newErrors.email = "E-Mail ist ungültig.";
    }
    if (!editUser?.phone || editUser.phone === "+49") {
      newErrors.phone = "Telefon ist erforderlich.";
    }
    if (!editUser?.sex) newErrors.sex = "Geschlecht ist erforderlich.";
    if (!editUser?.role) newErrors.role = "Rolle ist erforderlich.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate() && onSave && editUser) {
      onSave(editUser);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered dialogClassName="modal-50w-80h">
      <style jsx global>{`
        @media (min-width: 992px) {
          .modal-50w-80h .modal-dialog {
            max-width: 50vw !important;
            width: 50vw !important;
            height: 90vh !important;
            min-height: 90vh !important;
            margin: auto;
          }
          .modal-50w-80h .modal-content {
            height: 90vh !important;
            min-height: 90vh !important;
            overflow-y: auto;
          }
        }
        .modal-50w-80h .modal-content {
          background-color: #f8f9fa;
        }
      `}</style>
      <Modal.Header closeButton>
        <Modal.Title>Benutzer bearbeiten</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-1">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editUser.name}
                  onChange={e => handleFieldChange("name", e.target.value)}
                  isInvalid={!!errors.name}
                  required
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>Familienname</Form.Label>
                <Form.Control
                  type="text"
                  value={editUser.family}
                  onChange={e => handleFieldChange("family", e.target.value)}
                  isInvalid={!!errors.family}
                  required
                />
                <Form.Control.Feedback type="invalid">{errors.family}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>E-Mail</Form.Label>
                <Form.Control
                  type="email"
                  value={editUser.email}
                  onChange={e => handleFieldChange("email", e.target.value)}
                  isInvalid={!!errors.email}
                  required
                />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>Telefon</Form.Label>
                <Form.Control
                  type="tel"
                  value={editUser.phone}
                  onChange={e => handlePhoneChange(e.target.value)}
                  isInvalid={!!errors.phone}
                  required
                />
                <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-1">
                <Form.Label>Geschlecht</Form.Label>
                <Form.Select
                  value={editUser.sex}
                  onChange={e => handleFieldChange("sex", e.target.value)}
                  isInvalid={!!errors.sex}
                >
                  <option value="" disabled>Bitte auswählen</option>
                  <option value={SEX.male}>Männlich</option>
                  <option value={SEX.female}>Weiblich</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.sex}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>Rolle</Form.Label>
                <Form.Select
                  value={editUser.role}
                  onChange={e => handleFieldChange("role", e.target.value)}
                  isInvalid={!!errors.role}
                >
                  <option value="" disabled>Bitte auswählen</option>
                  <option value={ROLE.Customer}>Kunde</option>
                  <option value={ROLE.Provider}>Anbieter</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.role}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Check
                  type="checkbox"
                  label="Verifiziert"
                  checked={editUser.is_verified}
                  onChange={e => handleFieldChange("is_verified", e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex align-items-center justify-content-between">
        <Button variant="danger" onClick={() => onDelete(editUser)}>
          Löschen
        </Button>
        <div className="d-flex align-items-center">
          <Button variant="secondary" onClick={onHide}>
            Abbrechen
          </Button>
          <Button variant="primary" className="mx-2" onClick={handleSave}>
            Speichern
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
} 