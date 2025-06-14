"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import { InputGroup } from "react-bootstrap";
import { registerLocale } from "react-datepicker";
import { de } from "date-fns/locale/de";
import "react-datepicker/dist/react-datepicker.css";

// Register German locale
registerLocale("de", de);

type Props = {
  selected: Date | null;
  onChange: (date: Date | null) => void;
};

export default function GermanDatePicker({ selected, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: "inline-block" }}>
      <InputGroup>
        <InputGroup.Text
          onClick={() => setOpen((prev) => !prev)}
          style={{
            cursor: "pointer",
            backgroundColor: "#96A998",
            border: "1px solid #ced4da",
            borderRadius: "4px",
            padding: "6px 12px",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="white"
            viewBox="0 0 16 16"
          >
            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
          </svg>
        </InputGroup.Text>
      </InputGroup>

      {open && (
        <div style={{ position: "absolute", zIndex: 1000 }}>
          <DatePicker
          
            selected={selected}
            onChange={(date) => {
              setOpen(false);
              onChange(date);
            }}
            locale="de"
            dateFormat="dd.MM.yyyy"
            inline
            onClickOutside={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
