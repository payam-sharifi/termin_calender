"use client";

import { useState } from 'react';
import styles from './styles/services-list.module.css';

interface Service {
  id: number;
  name: string;
  color: string;
  duration: number; // duration in minutes
  price: number;
  providerName: string;
}

interface ServicesListProps {
  onServiceSelect: (service: Service) => void;
  onDragStart: (service: Service) => void;
}

const mockServices: Service[] = [
  { id: 1, name: 'Haarschnitt', color: '#FF5733', duration: 30, price: 2000, providerName: 'Maria' },
  { id: 2, name: 'Haarfärben', color: '#33FF57', duration: 120, price: 5000, providerName: 'Sarah' },
  { id: 3, name: 'Maniküre', color: '#3357FF', duration: 45, price: 1500, providerName: 'Sabine' },
  { id: 4, name: 'Pediküre', color: '#F333FF', duration: 60, price: 2500, providerName: 'Fatima' },
  { id: 5, name: 'Gesichtsbehandlung', color: '#33FFF3', duration: 90, price: 4000, providerName: 'Lena' },
];

export default function ServicesList({ onServiceSelect, onDragStart }: ServicesListProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [draggedService, setDraggedService] = useState<Service | null>(null);

  const handleDragStart = (e: React.DragEvent, service: Service) => {
    setDraggedService(service);
    onServiceSelect(service);
    onDragStart(service);
    // Set data for react-big-calendar's onDropFromOutside
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        type: 'event',
        dragAndDropAction: 'copy',
        service: service,
      })
    );
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragEnd = () => {
    setDraggedService(null);
  };

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    onServiceSelect(service);
  };

  return (
    <div className={styles.servicesListContainer}>
      <h2 className={styles.servicesListHeading}>Verfügbare Dienstleistungen</h2>
      <div className={styles.servicesGrid}>
        {mockServices.map((service) => (
          <div
            key={service.id}
            draggable
            onDragStart={(e) => handleDragStart(e, service)}
            onDragEnd={handleDragEnd}
            onClick={() => handleServiceClick(service)}
            className={`${styles.serviceItem} ${
              selectedService?.id === service.id
                ? styles.serviceItemSelected
                : ''
            } ${draggedService?.id === service.id ? styles.serviceItemDragging : ''}`}
            style={{ backgroundColor: service.color }}
          >
            <div className={styles.serviceContent}>
              <h3 className={styles.serviceName}>{service.name}</h3>
              <div className={styles.serviceDetails}>
                <p className={styles.serviceDetail}>
                  <span className={styles.detailLabel}>Preis:</span> 
                  <span className={styles.detailValue}>{service.price.toLocaleString()} €</span>
                </p>
                <p className={styles.serviceDetail}>
                  <span className={styles.detailLabel}>Dauer:</span> 
                  <span className={styles.detailValue}>{service.duration} Minuten</span>
                </p>
                <p className={styles.serviceDetail}>
                  <span className={styles.detailLabel}>Anbieter:</span> 
                  <span className={styles.detailValue}>{service.providerName}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}