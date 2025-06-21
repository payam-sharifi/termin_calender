"use client";

import { Modal, Button, Form } from "react-bootstrap";
import { CreateUserRqDataType, ROLE, SEX } from "@/services/userApi/user.types";

interface CreateUserModalProps {
  show: boolean;
  onHide: () => void;
  newUser: CreateUserRqDataType;
  onUserChange: (user: CreateUserRqDataType) => void;
  onCreate: () => void;
}

export default function CreateUserModal({
  show,
  onHide,
  newUser,
  onUserChange,
  onCreate,
}: CreateUserModalProps) {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="sm" 
      centered
      dialogClassName="modal-50w"
    >
      <style jsx global>{`
        .modal-50w {
          max-width: 40% !important;
          width: 40% !important;
        }
      `}</style>
      <Modal.Header closeButton>
        <Modal.Title>Neuer Benutzer</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-1">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={newUser.name}
              onChange={(e) => onUserChange({ ...newUser, name: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Label>Familienname</Form.Label>
            <Form.Control
              type="text"
              value={newUser.family}
              onChange={(e) => onUserChange({ ...newUser, family: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Label>E-Mail</Form.Label>
            <Form.Control
              type="email"
              value={newUser.email}
              onChange={(e) => onUserChange({ ...newUser, email: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Label>Telefon</Form.Label>
            <Form.Control
              type="tel"
              value={newUser.phone}
              onChange={(e) => onUserChange({ ...newUser, phone: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Label>Passwort</Form.Label>
            <Form.Control
              type="password"
              value={newUser.password}
              onChange={(e) => onUserChange({ ...newUser, password: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Label>Geschlecht</Form.Label>
            <Form.Select
              value={newUser.sex}
              onChange={(e) => onUserChange({ ...newUser, sex: e.target.value as unknown as SEX })}
            >
              <option value={SEX.male}>Männlich</option>
              <option value={SEX.female}>Weiblich</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Label>Rolle</Form.Label>
            <Form.Select
              value={newUser.role}
              onChange={(e) => onUserChange({ ...newUser, role: e.target.value as unknown as ROLE })}
            >
              <option value={ROLE.Customer}>Kunde</option>
              <option value={ROLE.Provider}>Anbieter</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Check
              type="checkbox"
              label="Verifiziert"
              checked={newUser.is_verified}
              onChange={(e) => onUserChange({ ...newUser, is_verified: e.target.checked })}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex align-items-center justify-content-between">
        <Button variant="danger" onClick={() => console.log("delete kunde")}>
          Speichern
        </Button>
        <div className="d-flex align-items-center">
          <Button variant="secondary" onClick={onHide}>
            Abbrechen
          </Button>
          <Button variant="primary" className="mx-2" onClick={onCreate}>
            Erstellen
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
} 