"use client";

import { Modal, Button, Row, Col } from "react-bootstrap";
import { Event } from "../types/event";



interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onDelete: (eventId: number) => void;
  onEdit: (event: Event) => void;
}

export default function EventDetailsModal({
  isOpen,
  onClose,
  event,
  onDelete,
  onEdit,
}: EventDetailsModalProps) {
  if (!event) return null;

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDelete = () => {
    if (window.confirm('Möchten Sie diesen Termin wirklich löschen?')) {
      onDelete(event.id);
      onClose();
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{event.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col md={4} className="fw-bold">Datum:</Col>
          <Col md={8}>{formatDate(event.start)}</Col>
        </Row>
        <Row className="mb-3">
          <Col md={4} className="fw-bold">Zeit:</Col>
          <Col md={8}>{formatTime(event.start)} - {formatTime(event.end)}</Col>
        </Row>
        <Row className="mb-3">
          <Col md={4} className="fw-bold">Service:</Col>
          <Col md={8}>{event.service.title} ({event.service.providerName})</Col>
        </Row>
        <Row className="mb-3">
          <Col md={4} className="fw-bold">Preis:</Col>
          <Col md={8}>{event.service.price}€</Col>
        </Row>
        <Row className="mb-3">
          <Col md={4} className="fw-bold">Kunde:</Col>
          <Col md={8}>{event.customerName} {event.customerFamily}</Col>
        </Row>
        <Row className="mb-3">
          <Col md={4} className="fw-bold">E-Mail:</Col>
          <Col md={8}>{event.customerEmail}</Col>
        </Row>
        <Row className="mb-3">
          <Col md={4} className="fw-bold">Telefon:</Col>
          <Col md={8}>{event.customerPhone}</Col>
        </Row>
        {event.description && (
          <Row className="mb-3">
            <Col md={4} className="fw-bold">Beschreibung:</Col>
            <Col md={8}>{event.description}</Col>
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleDelete} className="me-auto">
          Löschen
        </Button>
        <Button variant="secondary" onClick={onClose} className="me-2">
          Schließen
        </Button>
        <Button variant="primary" onClick={() => onEdit(event)}>
          Bearbeiten
        </Button>
      </Modal.Footer>
    </Modal>
  );
} 