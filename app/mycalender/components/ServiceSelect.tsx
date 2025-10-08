"use client";

import React from "react";
import { Dropdown } from "react-bootstrap";
import { serviceType } from "@/services/servicesApi/Service.types";

interface ServiceSelectProps {
  services: serviceType[];
  value?: string;
  onChange: (serviceId: string) => void;
  disabled?: boolean;
}

function getLabelColorByTitle(title: string): string {
  const lower = (title || "").toLowerCase();
  if (lower.includes("damen")) return "#0d6efd"; // Bootstrap primary blue
  if (lower.includes("herren")) return "#dc3545"; // Bootstrap danger red
  return "#6c757d"; // secondary gray
}

export default function ServiceSelect({ services, value, onChange, disabled }: ServiceSelectProps) {
  const selected = services?.find((s) => s.id === value) || services?.[0];
  const labelColor = selected ? getLabelColorByTitle(selected.title) : "#6c757d";

  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-secondary" id="service-select" disabled={disabled} style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {selected && (
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 999,
              backgroundColor: selected.color || labelColor,
              border: "1px solid rgba(0,0,0,0.15)",
            }}
          />
        )}
        <span style={{ color: labelColor }}>{selected ? selected.title : "Service auswählen"}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ maxHeight: 300, overflowY: "auto" }}>
        {services?.map((service) => {
          const color = getLabelColorByTitle(service.title);
          return (
            <Dropdown.Item key={service.id} active={service.id === value} onClick={() => onChange(service.id)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: service.color || color,
                  border: "1px solid rgba(0,0,0,0.15)",
                }}
              />
              <span style={{ color }}>{service.title}</span>
              <span style={{ marginLeft: "auto" }}>
                {service.duration}min • {service.price ? `${service.price}€` : "-"}
              </span>
            </Dropdown.Item>
          );
        })}
        {!services || services.length === 0 ? (
          <div className="px-3 py-2 text-muted">Keine Services verfügbar</div>
        ) : null}
      </Dropdown.Menu>
    </Dropdown>
  );
}


