"use client";

import React, { useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetUsers } from "@/services/hooks/user/useGetUsers";

interface CustomerSelectProps {
  /** Scope customers to this provider (required for API filter). */
  provider_id: string;
  value?: string; // customer id
  selectedLabel?: string; // e.g. "Vorname Nachname"
  onChange: (customer: any) => void;
  disabled?: boolean;
  /** e.g. „Für mich selbst“ — shown right of the „Kunden suchen“ title */
  headerRight?: React.ReactNode;
}

export default function CustomerSelect({ provider_id, value, selectedLabel, onChange, disabled, headerRight }: CustomerSelectProps) {
  const [search, setSearch] = useState("");

  const debounced = useDebounce(search, 400);
  const trimmed = debounced.trim();
  const isFilteredSearch = trimmed.length >= 3;
  const searchParam = isFilteredSearch ? trimmed : "";
  const pageSize = isFilteredSearch ? 10 : 5;

  const { data, isLoading } = useGetUsers(searchParam, pageSize, 1, provider_id, "Customer");

  const customers: any[] = useMemo(() => data?.data || [], [data?.data]);

  const handleSelect = (customer: any) => {
    onChange(customer);
  };

  return (
    <div>
      {headerRight ? (
        <div
          className="d-flex align-items-center justify-content-between gap-2 mb-2"
          style={{ flexWrap: "wrap" }}
        >
          <Form.Label className="mb-0" style={{ color: "#c5a059" }}>
            Kunden suchen
          </Form.Label>
          {headerRight}
        </div>
      ) : (
        <Form.Label className="mb-2" style={{ color: "#c5a059" }}>
          Kunden suchen
        </Form.Label>
      )}
      <Form.Control
        type="text"
        placeholder="Liste durchsuchen (ab 3 Zeichen eingrenzen)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
        style={{ fontSize: 16 }}
        autoComplete="off"
      />
    
      {value && selectedLabel ? (
        <div className="small mt-1 mb-2" style={{ color: "rgba(255,255,255,0.75)" }}>
          Ausgewählt: <strong>{selectedLabel}</strong>
        </div>
      ) : null}
      <div
        className="mt-2 rounded customer-select-list"
        style={{
          border: "1px solid var(--av-border, rgba(255,255,255,0.12))",
          minHeight: 140,
          maxHeight: "min(50vh, 360px)",
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        {isLoading ? (
          <div className="px-3 py-3 text-muted">Laden…</div>
        ) : customers.length === 0 ? (
          <div className="px-3 py-3 text-muted">
            {isFilteredSearch ? "Keine Kunden gefunden" : "Keine Kunden verfügbar"}
          </div>
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
                  background: isActive ? "rgba(197, 160, 89, 0.2)" : "rgba(255,255,255,0.04)",
                  border: "none",
                  borderTop: idx === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                <span style={{ fontWeight: 500, flex: 1, minWidth: 0, overflow: "hidden" }}>
                  {customer.name} {customer.family}
                  <span style={{ color: "rgba(255,255,255,0.5)", marginLeft: 8, fontSize: 12 }}>
                    {customer.phone || customer.email}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
