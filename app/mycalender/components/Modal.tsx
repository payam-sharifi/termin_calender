"use client";

import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
interface Service {
  id: number;
  name: string;
  color: string;
  duration: number;
}

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
  selectedSlot?: { start: Date; end: Date };
  selectedService?: Service;
}

export default function EventFormModal({
  isOpen,
  onClose,
  onSubmit,
  selectedSlot,
  selectedService
}: EventFormModalProps) {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerFamily, setCustomerFamily] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (selectedSlot && selectedService) {
      setStart(new Date(selectedSlot.start));
      const endTime = new Date(selectedSlot.start);
      endTime.setMinutes(endTime.getMinutes() + selectedService.duration);
      setEnd(endTime);
      setTitle(selectedService.name);
    }
  }, [selectedSlot, selectedService]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end || !selectedService) return;

    onSubmit({
      title,
      start,
      end,
      service: selectedService,
      customerName,
      customerFamily,
      customerEmail,
      customerPhone,
      description
    });

    // Reset form
    setTitle('');
    setStart(null);
    setEnd(null);
    setCustomerName('');
    setCustomerFamily('');
    setCustomerEmail('');
    setCustomerPhone('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Form>
    <Form.Group className="mb-3" controlId="formBasicEmail">
      <Form.Label>Email address</Form.Label>
      <Form.Control type="email" placeholder="Enter email" />
      <Form.Text className="text-muted">
        We'll never share your email with anyone else.
      </Form.Text>
    </Form.Group>

    <Form.Group className="mb-3" controlId="formBasicPassword">
      <Form.Label>Password</Form.Label>
      <Form.Control type="password" placeholder="Password" />
    </Form.Group>
    <Form.Group className="mb-3" controlId="formBasicCheckbox">
      <Form.Check type="checkbox" label="Check me out" />
    </Form.Group>
    <Button variant="primary" type="submit">
      Submit
    </Button>
  </Form>
  );
} 