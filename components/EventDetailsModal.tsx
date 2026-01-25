"use client";

import { Modal, Button, Row, Col } from "react-bootstrap";
import { Event } from "../types/event";
import { useDeleteTimeSlotById } from "@/services/hooks/timeSlots/useDeleteTimeSlot";
import { toast } from "react-toastify";
import SafeDeleteModal from "./SafeDeleteModal";
import { useState } from "react";



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
  const {mutate}=useDeleteTimeSlotById()
  const [openDeleteModal,setOpenDeleteModal]=useState<boolean>(false)
  if (!event) {
    return null;
  }
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
    const isSelfReservation = (event as any).isSelfReservation;
    // For self-reservations, customerPhone is empty, but we still need slotId to delete
    // For regular reservations, both slotId and customerPhone are required
    if(event.slotId && (isSelfReservation || event.customerPhone)){
      // For self-reservations, use placeholder since backend route requires phone parameter
      // but service method doesn't actually use it (only uses id)
      const phone = isSelfReservation ? "self" : event.customerPhone;
      
      mutate({id:event.slotId,phone:phone}
        ,{
          onSuccess: (res) => {
            toast.success(res.message);
            onDelete(event.id);
            onClose();
          },
          onError: (error: any) => {
            toast.error(error?.message);
          }
        }
      )
    }
  };

  return (
    <>
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
        {/* <Row className="mb-3">
          <Col md={4} className="fw-bold">Service:</Col>
          <Col md={8}>{event.service.title} ({event.service.providerName})</Col>
        </Row> */}
        <Row className="mb-3">
          <Col md={4} className="fw-bold">Preis:</Col>
          <Col md={8}>{event.service.price}€</Col>
        </Row>
        <Row className="mb-3">
          <Col md={4} className="fw-bold">Kunde:</Col>
          <Col md={8}>{(event as any).isSelfReservation ? "Selbst" : `${event.customerName} ${event.customerFamily}`.trim()}</Col>
        </Row>
        {!(event as any).isSelfReservation && (
          <>
            <Row className="mb-3">
              <Col md={4} className="fw-bold">E-Mail:</Col>
              <Col md={8}>{event.customerEmail}</Col>
            </Row>
            <Row className="mb-3">
              <Col md={4} className="fw-bold">Telefon:</Col>
              <Col md={8}>{event.customerPhone}</Col>
            </Row>
          </>
        )}
        {(event.description || (event as any).desc) && (
          <Row className="mb-3">
            <Col md={4} className="fw-bold">Beschreibung:</Col>
            <Col md={8}>{event.description || (event as any).desc || ""}</Col>
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={()=>{
          
          setOpenDeleteModal(true)
          onClose()
          }} className="me-auto">
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

    <SafeDeleteModal
     isOpen={openDeleteModal}
     onClose={()=>setOpenDeleteModal(false)}
     onConfirm={handleDelete}
    />
    </>
  );
} 