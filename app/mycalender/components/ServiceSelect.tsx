"use client";

import React, { useMemo, useState } from "react";
import { Dropdown, Form, Button } from "react-bootstrap";
import { serviceType } from "@/services/servicesApi/Service.types";

interface ServiceSelectProps {
  services: serviceType[];
  value?: string;
  onChange: (serviceId: string) => void;
  disabled?: boolean;
}

function getLabelColorByTitle(title: string): string {
  const lower = (title || "").toLowerCase();
  if (lower.includes("damen")) return "#dc3545"; // Bootstrap primary red 
  if (lower.includes("herren")) return "#0d6efd"; // Bootstrap danger blue
  return "#6c757d"; // secondary gray
}

export default function ServiceSelect({ services, value, onChange, disabled }: ServiceSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = useMemo(() => services?.find((s) => s.id === value) || null, [services, value]);
  const labelColor = selected ? getLabelColorByTitle(selected.title) : "#6c757d";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services || [];
    return (services || []).filter((s) =>
      [s.title, String(s.price ?? ""), String(s.duration ?? "")].some((f) => (f || "").toString().toLowerCase().includes(q))
    );
  }, [services, search]);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <Dropdown show={open} onToggle={(next) => setOpen(!!next)}>
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

      <Dropdown.Menu style={{ width: 420, paddingTop: 8, paddingBottom: 8 }} align="start">
        <div className="px-3 mb-2" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Form.Control
            size="sm"
            type="text"
            placeholder="Service suchen"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button size="sm" variant="primary" onClick={() => setOpen(false)}>
            ✓
          </Button>
        </div>
        <div style={{ maxHeight: 360, overflowY: "auto" }}>
          {filtered?.map((service, idx) => {
            const titleColor = getLabelColorByTitle(service.title);
            const isActive = service.id === value;
            return (
              <button
                type="button"
                key={service.id}
                className="w-100"
                onClick={() => handleSelect(service.id)}
                style={{
                  background: isActive ? "#eef5ff" : "#fff",
                  border: "none",
                  borderTop: idx === 0 ? "none" : "1px solid #f1f3f5",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: service.color || titleColor,
                    border: "1px solid rgba(0,0,0,0.15)",
                    marginRight: 10,
                  }}
                />
                <span style={{ color: titleColor, fontWeight: 500, flex: 1, minWidth: 0, whiteSpace: "normal", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {service.title}
                </span>
                <span style={{ color: "#6c757d", fontSize: 12, marginLeft: 12 }}>
                  {service.duration ? `${service.duration}min` : "-"} / {service.price != null ? `${service.price}€` : "-"}
                </span>
              </button>
            );
          })}
          {!filtered || filtered.length === 0 ? (
            <div className="px-3 py-2 text-muted">Keine Services gefunden</div>
          ) : null}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}


