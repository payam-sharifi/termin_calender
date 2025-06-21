"use client";

import Link from "next/link";
import { FaTimes } from "react-icons/fa";
import { ServiceRsDataType, serviceType } from "@/services/servicesApi/Service.types";

interface SidebarProps {
  isOpen: boolean;
  services: ServiceRsDataType;
  onNewServiceClick: () => void;
  onNewTerminClick: () => void;
  onServiceClick: (service: serviceType) => void;
  onDeleteService: (serviceId: string, e: React.MouseEvent) => void;
  onLogout: () => void;
}

export default function Sidebar({
  isOpen,
  services,
  onNewServiceClick,
  onNewTerminClick,
  onServiceClick,
  onDeleteService,
  onLogout,
}: SidebarProps) {
  return (
    <section className={isOpen ? "sidebar" : "closed sidebar"}>
      <div
        className="services-list"
        style={{
          padding: "20px",
          paddingTop: "40px",
          maxHeight: '80vh',
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <Link href="/dashboard/users" className="btn" style={{ backgroundColor: "#ACD1AF", textDecoration: 'none' }}>
          Nue Kunde
        </Link>

        <button
          onClick={onNewServiceClick}
          className="btn"
          style={{ backgroundColor: "#ACD1AF" }}
        >
          Nue Service
        </button>
        <button
          className="btn"
          onClick={onNewTerminClick}
          style={{ backgroundColor: "#ACD1AF" }}
        >
          Nue Termin
        </button>

        {Array.isArray(services) &&
          services.map((service) => (
            <button
              key={service.id}
              className="btn position-relative"
              style={{ backgroundColor: service.color }}
              title={service.title}
              onClick={() => onServiceClick(service)}
            >
              {service.title}
              <FaTimes
                className="position-absolute"
                style={{
                  right: "4px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  opacity: 0.8,
                  transition: "opacity 0.2s",
                }}
                onClick={(e) => onDeleteService(service.id, e)}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.8"; }}
              />
            </button>
          ))}
        <button
          onClick={onLogout}
          className="btn btn-danger"
        >
          logout
        </button>
      </div>
    </section>
  );
} 