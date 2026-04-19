"use client";

import {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import DatePicker from "react-datepicker";
import { InputGroup } from "react-bootstrap";
import { registerLocale } from "react-datepicker";
import { de } from "date-fns/locale/de";
import {
  getCalendarDayClassName,
  getCalendarWeekDayClassName,
} from "@/lib/calendarDayClassName";

// Register German locale
registerLocale("de", de);

export type GermanDatePickerHandle = {
  open: () => void;
};

type Props = {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  filterDate?: (date: Date) => boolean;
};

const GermanDatePicker = forwardRef<GermanDatePickerHandle, Props>(
  function GermanDatePicker(
    { selected, onChange, minDate, filterDate },
    ref,
  ) {
    const [open, setOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
    }));

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
            <i
              className="bi bi-calendar3"
              style={{ fontSize: "1.2rem", cursor: "pointer" }}
            ></i>
          </InputGroup.Text>
        </InputGroup>

        {open && (
          <div
            style={{
              position: "fixed",
              zIndex: 1000,
              width: "100vw",

              left: "0",
              top: "0",
              transform: "none",
            }}
            className="mobile-datepicker-container"
          >
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
              className="mobile-datepicker"
              dayClassName={getCalendarDayClassName}
              weekDayClassName={getCalendarWeekDayClassName}
            />
          </div>
        )}
      </div>
    );
  },
);

export default GermanDatePicker;
