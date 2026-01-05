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
  if (lower.includes("damen")) return "#0d6efd"; // Bootstrap danger blue
  if (lower.includes("herren")) return "#dc3545"; // Bootstrap primary red
  return "#6c757d"; // secondary gray
}

function getServiceCategory(title: string): string {
  const lower = (title || "").toLowerCase();
  if (lower.includes("damen")) return "Damen";
  if (lower.includes("herren")) return "Herren";
  return "Other";
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

  // Group and sort services by category
  const groupedAndSortedServices = useMemo(() => {
    const grouped: Record<string, serviceType[]> = {
      Damen: [],
      Herren: [],
      Other: [],
    };

    // Group services by category
    filtered.forEach((service) => {
      const category = getServiceCategory(service.title);
      grouped[category].push(service);
    });

    // Sort services within each category alphabetically by title
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => a.title.localeCompare(b.title, "de"));
    });

    // Return in order: Damen, Herren, Other
    return [
      { category: "Damen", services: grouped.Damen },
      { category: "Herren", services: grouped.Herren },
      { category: "Other", services: grouped.Other },
    ].filter((group) => group.services.length > 0);
  }, [filtered]);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <Dropdown show={open} onToggle={(next) => setOpen(!!next)}>
      <Dropdown.Toggle variant="outline-secondary" id="service-select" disabled={disabled} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", maxWidth: "100%" }}>
        {selected && (
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 999,
              backgroundColor: selected.color || labelColor,
              border: "1px solid rgba(0,0,0,0.15)",
              flexShrink: 0,
            }}
          />
        )}
        <span style={{ 
          color: labelColor, 
          overflow: "hidden", 
          textOverflow: "ellipsis", 
          whiteSpace: "nowrap",
          flex: 1,
          minWidth: 0
        }}>
          {selected ? selected.title : "Service auswählen"}
        </span>
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
          {groupedAndSortedServices.length > 0 ? (
            groupedAndSortedServices.map((group, groupIdx) => (
              <div key={group.category}>
                {groupIdx > 0 && (
                  <div style={{ borderTop: "1px solid #e0e0e0", margin: "8px 0" }} />
                )}
                {group.category !== "Other" && (
                  <div
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#f8f9fa",
                      fontWeight: 600,
                      fontSize: 13,
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {group.category}
                  </div>
                )}
                {group.services.map((service) => {
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
                        borderTop: "1px solid #f1f3f5",
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
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-muted">Keine Services gefunden</div>
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}


