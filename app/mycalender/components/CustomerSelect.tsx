"use client";

import React, { useMemo, useState } from "react";
import { Dropdown, Form, Button } from "react-bootstrap";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetUsers } from "@/services/hooks/user/useGetUsers";

interface CustomerSelectProps {
  value?: string; // customer id
  selectedLabel?: string; // e.g. "Vorname Nachname"
  onChange: (customer: any) => void;
  disabled?: boolean;
}

export default function CustomerSelect({ value, selectedLabel, onChange, disabled }: CustomerSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const debounced = useDebounce(search, 400);
  const { data, isLoading } = useGetUsers(
    debounced.trim().length >= 3 ? debounced : "",
    10,
    1,
    "Customer"
  );

  const customers: any[] = useMemo(() => data?.data || [], [data?.data]);

  const handleSelect = (customer: any) => {
    onChange(customer);
    setOpen(false);
  };

  return (
    <Dropdown show={open} onToggle={(next) => setOpen(!!next)}>
      <Dropdown.Toggle variant="outline-secondary" id="customer-select" disabled={disabled} style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#6c757d" }}>{value ? (selectedLabel || "Kunde ausgewählt") : "Kunde auswählen"}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: 300, paddingTop: 8, paddingBottom: 8 }} align="start">
        <div className="px-3 mb-2" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Form.Control
            size="sm"
            type="text"
            placeholder="Kunden suchen (min. 3 Zeichen)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button size="sm" variant="primary" onClick={() => setOpen(false)}>
            ✓
          </Button>
        </div>
        <div style={{ maxHeight: 240, overflowY: "auto" }}>
          {isLoading ? (
            <div className="px-3 py-2 text-muted">Laden...</div>
          ) : customers.length === 0 && debounced.trim().length >= 3 ? (
            <div className="px-3 py-2 text-muted">Keine Kunden gefunden</div>
          ) : (
            customers.map((customer: any, idx: number) => {
              const isActive = customer.id === value;
              return (
                <button
                  key={customer.id}
                  type="button"
                  className="w-100"
                  onClick={() => handleSelect(customer)}
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
                  <span style={{ fontWeight: 500, flex: 1, minWidth: 0, overflow: "hidden" }}>
                    {customer.name} {customer.family}
                    <span style={{ color: "#6c757d", marginLeft: 8, fontSize: 12 }}>{customer.phone || customer.email}</span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}


