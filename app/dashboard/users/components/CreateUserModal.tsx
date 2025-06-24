"use client";

import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { CreateUserRqDataType, ROLE, SEX } from "@/services/userApi/user.types";
import { useState, useMemo, useEffect } from "react";

interface CreateUserModalProps {
  show: boolean;
  onHide: () => void;
  newUser: Omit<CreateUserRqDataType, "role" | "sex"> & { role: string; sex: string };
  onUserChange: (user: any) => void;
  onCreate: () => void;
}

export default function CreateUserModal({
  show,
  onHide,
  newUser,
  onUserChange,
  onCreate,
}: CreateUserModalProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof CreateUserRqDataType, string>>>({});
  const [roleSearch, setRoleSearch] = useState("");
  // const [repeatPassword, setRepeatPassword] = useState("");
  // const [repeatPasswordError, setRepeatPasswordError] = useState("");

  const filteredRoles = useMemo(() => {
    return Object.values(ROLE).filter(role => 
      role.toLowerCase().includes(roleSearch.toLowerCase())
    );
  }, [roleSearch]);

  useEffect(() => {
    if (show && (!newUser.phone || !newUser.phone.startsWith("+49"))) {
      onUserChange({ ...newUser, phone: "+49" });
    }
    // eslint-disable-next-line
  }, [show]);

  const handleFieldChange = (field: keyof CreateUserRqDataType, value: any) => {
    onUserChange({ ...newUser, [field]: value });
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
    const newErrors: Partial<Record<keyof CreateUserRqDataType, string>> = {};
    if (!newUser.name) newErrors.name = "Name ist erforderlich.";
    if (!newUser.family) newErrors.family = "Nachname ist erforderlich.";
    // if (!newUser.email) {
    //   newErrors.email = "E-Mail ist erforderlich.";
    // } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
    //   newErrors.email = "E-Mail ist ungültig.";
    // }
    if (newUser?.email && !/\S+@\S+\.\S+/.test(newUser.email)) {
      newErrors.email = "E-Mail ist ungültig.";
    }

    if (!newUser.phone || newUser.phone === "+49") {
      newErrors.phone = "Telefon ist erforderlich.";
    }
    // if (!newUser.password) newErrors.password = "Passwort ist erforderlich.";
    // if (newUser.password && newUser.password.length < 6) newErrors.password = "Das Passwort muss mindestens 6 Zeichen lang sein.";
    if (newUser.sex === "") newErrors.sex = "Geschlecht ist erforderlich.";
    if (newUser.role === "") newErrors.role = "Rolle ist erforderlich.";
    // if (!repeatPassword) {
    //   setRepeatPasswordError("Passwort wiederholen ist erforderlich.");
    //   return false;
    // } else if (newUser.password !== repeatPassword) {
    //   setRepeatPasswordError("Passwörter stimmen nicht überein.");
    //   return false;
    // } else {
    //   setRepeatPasswordError("");
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (validate()) {
      onCreate();
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg" 
      centered
      dialogClassName="modal-50w-80h"
    >
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
        <Modal.Title>Neuer Benutzer</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-1">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={newUser.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  isInvalid={!!errors.name}
                  required
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>Familienname</Form.Label>
                <Form.Control
                  type="text"
                  value={newUser.family}
                  onChange={(e) => handleFieldChange('family', e.target.value)}
                  isInvalid={!!errors.family}
                  required
                />
                <Form.Control.Feedback type="invalid">{errors.family}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>E-Mail</Form.Label>
                <Form.Control
                  type="email"
                  value={newUser.email ?? ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  isInvalid={!!errors.email}
                  required
                />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>Telefon</Form.Label>
                <Form.Control
                  type="tel"
                  value={newUser.phone}
                  onChange={e => handlePhoneChange(e.target.value)}
                  isInvalid={!!errors.phone}
                  required
                />
                <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              {/* <Form.Group className="mb-1">
                <Form.Label>Passwort</Form.Label>
                <Form.Control
                  type="password"
                  value={newUser.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>Passwort wiederholen</Form.Label>
                <Form.Control
                  type="password"
                  value={repeatPassword}
                  onChange={e => {
                    setRepeatPassword(e.target.value);
                    if (repeatPasswordError) setRepeatPasswordError("");
                  }}
                  isInvalid={!!repeatPasswordError}
                />
                <Form.Control.Feedback type="invalid">{repeatPasswordError}</Form.Control.Feedback>
              </Form.Group> */}
              <Form.Group className="mb-1">
                <Form.Label>Geschlecht</Form.Label>
                <Form.Select
                  value={newUser.sex}
                  onChange={(e) => handleFieldChange('sex', e.target.value)}
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
                  value={newUser.role}
                  onChange={(e) => handleFieldChange('role', e.target.value)}
                  isInvalid={!!errors.role}
                >
                  <option value="" disabled>Bitte auswählen</option>
                  {filteredRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.role}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Check
                  type="checkbox"
                  label="Verifiziert"
                  checked={newUser.is_verified}
                  onChange={(e) => handleFieldChange('is_verified', e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex align-items-center">
          <Button variant="secondary" onClick={onHide}>
            Abbrechen
          </Button>
          <Button variant="primary" className="mx-2" onClick={handleCreate}>
            Erstellen
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
} 