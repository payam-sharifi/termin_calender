"use client";

import { Modal, Button, Form } from "react-bootstrap";
import { UserRsDataType, ROLE, SEX } from "@/services/userApi/user.types";

interface EditUserModalProps {
  show: boolean;
  onHide: () => void;
  user: UserRsDataType | null;
  onDelete: (user: UserRsDataType) => void;
}

export default function EditUserModal({
  show,
  onHide,
  user,
  onDelete,
}: EditUserModalProps) {
  if (!user) return null;

  return (
    <Modal show={show} onHide={onHide} size="sm" centered dialogClassName="modal-50w">
      <style jsx global>{`
        .modal-50w {
          max-width: 40% !important;
          width: 40% !important;
        }
      `}</style>
      <Modal.Header closeButton>
        <Modal.Title>Benutzer bearbeiten</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-1">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              defaultValue={user.name}
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Label>Familienname</Form.Label>
            <Form.Control
              type="text"
              defaultValue={user.family}
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Label>E-Mail</Form.Label>
            <Form.Control
              type="email"
              defaultValue={user.email}
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Label>Telefon</Form.Label>
            <Form.Control
              type="tel"
              defaultValue={user.phone}
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Label>Geschlecht</Form.Label>
            <Form.Select defaultValue={user.sex}>
              <option value={SEX.male}>Männlich</option>
              <option value={SEX.female}>Weiblich</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Label>Rolle</Form.Label>
            <Form.Select defaultValue={user.role}>
              <option value={ROLE.Customer}>Kunde</option>
              <option value={ROLE.Provider}>Anbieter</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Check
              type="checkbox"
              label="Verifiziert"
              defaultChecked={user.is_verified}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex align-items-center justify-content-between">
        <Button 
          variant="danger" 
          onClick={() => onDelete(user)}
        >
          Löschen
        </Button>
        <div className="d-flex align-items-center">
          <Button variant="secondary" onClick={onHide}>
            Abbrechen
          </Button>
          <Button variant="primary" className="mx-2" onClick={onHide}>
            Speichern
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
} 