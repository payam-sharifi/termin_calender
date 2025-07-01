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
  minDate?: Date;
  filterDate?: (date: Date) => boolean;
};

export default function GermanDatePicker({ selected, onChange, minDate, filterDate }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: "inline-block" }}>
      <InputGroup>
        <InputGroup.Text
          onClick={() => setOpen((prev) => !prev)}
          style={{
            cursor: "pointer",
        
            border: "1px #ced4da",
            borderRadius: "4px",
            padding: "1px 2px",
          }}
        >
          <i className="bi bi-calendar3" style={{ fontSize: "1.2rem", cursor: "pointer" }}></i>
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
            minDate={minDate}
            filterDate={filterDate}
          />
        </div>
      )}
    </div>
  );
}
