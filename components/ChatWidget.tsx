"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllServices } from "@/services/servicesApi";
import type { serviceType } from "@/services/servicesApi/Service.types";
import { CALENDAR_APPOINTMENT_CREATED_EVENT } from "@/lib/calendarEvents";
import styles from "./ChatWidget.module.css";

type Role = "user" | "assistant";

export type ChatMessage = {
  role: Role;
  content: string;
  alternatives?: string[];
};

type CustomerRow = {
  id: string;
  name: string;
  family: string;
};

type ServiceRow = {
  id: string;
  line: string;
};

/** customer → service → datetime → confirm → complete */
type ReservationStep =
  | "customer"
  | "service"
  | "datetime"
  | "confirm"
  | "complete";

const FALLBACK_REPLY =
  "Beim Kontakt zum Assistenten ist ein Fehler aufgetreten. Bitte versuchen Sie es gleich noch einmal.";

const PROVIDER_ID_URL_KEYS = [
  "providerId",
  "provider",
  "chatProviderId",
] as const;

function resolveProviderIdFromUrlSearch(search: URLSearchParams): string {
  for (const key of PROVIDER_ID_URL_KEYS) {
    const v = search.get(key)?.trim();
    if (v) return v;
  }
  return "";
}

/**
 * Provider id from route: `/dashboard/service/:provider_id` (calendar) or
 * `/dashboard/services/:provider_id` (service list). Segment after `service` / `services`.
 */
function resolveProviderIdFromPathname(pathname: string | null): string {
  if (!pathname) return "";
  const segments = pathname.split("/").filter(Boolean);
  for (const marker of ["service", "services"] as const) {
    const i = segments.indexOf(marker);
    const id = segments[i + 1]?.trim();
    if (i !== -1 && id) return id;
  }
  return "";
}

/** GET /service/:id returns either an array or { message, data: [] } when empty. */
function normalizeServicesPayload(data: unknown): serviceType[] {
  if (Array.isArray(data)) return data as serviceType[];
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data: unknown }).data)
  ) {
    return (data as { data: serviceType[] }).data;
  }
  return [];
}

/** Same formatting as backend AgentService.serviceLine */
function formatServiceLine(s: serviceType): string {
  return `${s.title} (${s.duration} min.) — ${s.price}€`;
}

const DATETIME_INSTRUCTION = `**Datum/Uhrzeit** (24 h, lokale System-Zeit):
• Vollständig: JJJJ-MM-TT HH:mm — optional **Dauer** dahinter als HH:mm (z. B. \`2026-04-21 10:00 00:30\` = 30 Min.; sonst gilt die Dienst-Dauer)
• Nur Datum: JJJJ-MM-TT (dann 09:00)
• Kurz: eine Zahl = Tag · zwei Zahlen = Tag und Monat — optional Start **und** Dauer: \`15 4 10:00 00:45\``;

function parseCustomers(raw: unknown): CustomerRow[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out: CustomerRow[] = [];
  for (const x of raw) {
    if (x && typeof x === "object" && "id" in x) {
      const o = x as Record<string, unknown>;
      if (typeof o.id === "string") {
        out.push({
          id: o.id,
          name: typeof o.name === "string" ? o.name : "",
          family: typeof o.family === "string" ? o.family : "",
        });
      }
    }
  }
  return out.length > 0 ? out : null;
}

function customerLabel(c: CustomerRow): string {
  return [c.name, c.family].filter(Boolean).join(" ").trim() || c.id;
}

/** One step back in the booking flow (German + English). */
function isGoBackCommand(raw: string): boolean {
  const t = raw.trim().toLowerCase();
  return (
    t === "back" ||
    t === "zurück" ||
    t === "zurueck" ||
    t === "zuruck" ||
    t === "previous" ||
    t === "prev"
  );
}

function ChatWidgetInner() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const chatProviderId = useMemo(() => {
    const fromPath = resolveProviderIdFromPathname(pathname);
    if (fromPath) return fromPath;
    return resolveProviderIdFromUrlSearch(searchParams);
  }, [pathname, searchParams]);

  const [open, setOpen] = useState(false);
  const [reservationStep, setReservationStep] =
    useState<ReservationStep>("customer");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );
  /** Selbstbuchung (provider blocks time for themselves), same as calendar “Selbst”. */
  const [selfReservation, setSelfReservation] = useState(false);
  /** Last accepted date/time string (same format sent on confirm). */
  const [pendingDateTime, setPendingDateTime] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [customerPickList, setCustomerPickList] = useState<
    CustomerRow[] | null
  >(null);
  const [servicePickList, setServicePickList] = useState<ServiceRow[] | null>(
    null,
  );
  const serviceBootstrapRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const servicesQuery = useQuery({
    queryKey: ["getServices", chatProviderId],
    queryFn: () => getAllServices(chatProviderId!),
    enabled: Boolean(chatProviderId) && open,
    staleTime: 60_000,
  });

  const fullServiceList = useMemo((): ServiceRow[] | null => {
    if (!chatProviderId) return null;
    if (servicesQuery.data === undefined) return null;
    const raw = normalizeServicesPayload(servicesQuery.data);
    return raw.map((s) => ({ id: s.id, line: formatServiceLine(s) }));
  }, [chatProviderId, servicesQuery.data]);

  const toggleOpen = useCallback(() => {
    setOpen((o) => {
      const next = !o;
      if (next) setPanelVisible(true);
      return next;
    });
  }, []);

  /** Full reset — new conversation when reopening after close/outside dismiss. */
  const resetChatSession = useCallback(() => {
    setReservationStep("customer");
    setSelectedCustomerId(null);
    setSelectedServiceId(null);
    setSelfReservation(false);
    setPendingDateTime(null);
    setInput("");
    setMessages([]);
    setCustomerPickList(null);
    setServicePickList(null);
    serviceBootstrapRef.current = false;
    setLoading(false);
  }, []);

  /** Hide panel; keep messages and flow state (like −). */
  const minimizeChat = useCallback(() => {
    setOpen(false);
  }, []);

  /** Hide panel and discard conversation (like ✕ or outside click). */
  const closeAndClearChat = useCallback(() => {
    resetChatSession();
    setOpen(false);
  }, [resetChatSession]);

  useEffect(() => {
    serviceBootstrapRef.current = false;
  }, [chatProviderId, selfReservation]);

  useEffect(() => {
    if (open) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    } else {
      closeTimerRef.current = setTimeout(() => setPanelVisible(false), 220);
    }
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [open]);

  /** New calendar/provider context: clear session. */
  useEffect(() => {
    resetChatSession();
  }, [chatProviderId, resetChatSession]);

  /** Click outside the widget = minimize (same as −, conversation stays). */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el || el.contains(e.target as Node)) return;
      minimizeChat();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, minimizeChat]);

  /** When entering the service step, load the same list as GET /service/:providerId and show numbered options. */
  useEffect(() => {
    if (!open || reservationStep !== "service" || !chatProviderId || selfReservation)
      return;
    if (servicesQuery.isPending) return;
    if (servicesQuery.isError) {
      if (!serviceBootstrapRef.current) {
        serviceBootstrapRef.current = true;
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Dienste konnten nicht geladen werden. Bitte ggf. anmelden oder /dashboard/service/… bzw. ?providerId=… prüfen.",
          },
        ]);
      }
      return;
    }
    if (serviceBootstrapRef.current) return;
    serviceBootstrapRef.current = true;

    const rows = fullServiceList ?? [];
    if (rows.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Für diesen Anbieter sind noch keine Dienste hinterlegt (gleiche Quelle wie der Kalender).",
        },
      ]);
      setServicePickList(null);
      return;
    }
    setServicePickList(rows);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          rows.length === 1
            ? "Ein Dienst ist verfügbar. Geben Sie **1** ein, oder filtern Sie mit Suchworten."
            : `Dienste (gleiche Reihenfolge wie nach der Anmeldung) — antworten Sie mit **1–${rows.length}**, oder filtern Sie mit Suchworten.`,
        alternatives: rows.map((r) => r.line),
      },
    ]);
  }, [
    open,
    reservationStep,
    chatProviderId,
    selfReservation,
    servicesQuery.isPending,
    servicesQuery.isError,
    fullServiceList,
  ]);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, loading, open, scrollToBottom, servicesQuery.isPending]);

  const inputFocusBlocked =
    loading ||
    reservationStep === "complete" ||
    (reservationStep === "service" &&
      Boolean(chatProviderId) &&
      servicesQuery.isPending);

  useEffect(() => {
    if (!open || !panelVisible || inputFocusBlocked) return;
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [open, panelVisible, inputFocusBlocked, messages.length]);

  const beginDatetimeStep = useCallback(
    (serviceId: string) => {
      setSelectedServiceId(serviceId);
      if (!chatProviderId) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Kein Kalender-Anbieter in der URL. Seite unter /dashboard/service/ mit Anbieter-ID öffnen oder ?providerId=… anhängen.",
          },
        ]);
        setReservationStep("complete");
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: DATETIME_INSTRUCTION },
      ]);
      setReservationStep("datetime");
    },
    [chatProviderId],
  );

  const runDateTimeCheck = useCallback(
    async (value: string) => {
      if (!chatProviderId) return;
      if (!selfReservation && !selectedServiceId) return;
      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dateTime: value,
            providerId: chatProviderId,
            ...(selfReservation
              ? { selfReservation: true }
              : { serviceId: selectedServiceId }),
          }),
        });
        let data: {
          message?: string;
          success?: boolean;
        } = {};
        try {
          data = (await res.json()) as typeof data;
        } catch {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: FALLBACK_REPLY },
          ]);
          return;
        }

        const replyText = (msg: unknown): string =>
          typeof msg === "string" && msg.trim() ? msg : FALLBACK_REPLY;

        if (!res.ok) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: replyText(data.message) },
          ]);
          return;
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: replyText(data.message) },
        ]);

        if (data.success === true) {
          setPendingDateTime(value.trim());
          setReservationStep("confirm");
        } else {
          setPendingDateTime(null);
        }
      } finally {
        setLoading(false);
      }
    },
    [selectedServiceId, chatProviderId, selfReservation],
  );

  const send = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (loading && !isGoBackCommand(trimmed)) return;
    if (reservationStep === "complete" && !isGoBackCommand(trimmed)) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        {
          role: "assistant",
          content:
            "Die Buchung ist erledigt. Geben Sie **zurück** oder **back** ein, um eine neue Buchung zu starten.",
        },
      ]);
      setInput("");
      return;
    }

    const replyText = (msg: unknown): string =>
      typeof msg === "string" && msg.trim() ? msg : FALLBACK_REPLY;

    const serviceLoadingBlocking =
      reservationStep === "service" &&
      Boolean(chatProviderId) &&
      servicesQuery.isPending;

    if (serviceLoadingBlocking) return;

    // ——— Go back one step (zurück / back) ———
    if (isGoBackCommand(trimmed)) {
      setLoading(false);
      const userLine = { role: "user" as const, content: trimmed };
      if (reservationStep === "complete") {
        setMessages((prev) => [
          ...prev,
          userLine,
          {
            role: "assistant",
            content:
              "Neue Buchung: Geben Sie einen Kundennamen ein oder **selbst** für eine Selbstbuchung.",
          },
        ]);
        setReservationStep("customer");
        setSelectedCustomerId(null);
        setSelectedServiceId(null);
        setSelfReservation(false);
        setPendingDateTime(null);
        setCustomerPickList(null);
        setServicePickList(null);
        serviceBootstrapRef.current = false;
        setInput("");
        return;
      }
      if (reservationStep === "customer") {
        setMessages((prev) => [
          ...prev,
          userLine,
          {
            role: "assistant",
            content:
              "Sie sind bereits beim ersten Schritt. Geben Sie einen Kundennamen ein oder **selbst**.",
          },
        ]);
        setInput("");
        return;
      }
      if (reservationStep === "confirm") {
        setMessages((prev) => [
          ...prev,
          userLine,
          {
            role: "assistant",
            content:
              "Zurück zur Datumseingabe. Passen Sie Datum und Uhrzeit an und senden Sie erneut.",
          },
        ]);
        setReservationStep("datetime");
        setPendingDateTime(null);
        setInput("");
        return;
      }
      if (reservationStep === "datetime") {
        if (selfReservation) {
          setMessages((prev) => [
            ...prev,
            userLine,
            {
              role: "assistant",
              content:
                "Zurück zur Kundenauswahl. Geben Sie einen Namen ein oder **selbst** für eine Selbstbuchung.",
            },
          ]);
          setReservationStep("customer");
          setSelfReservation(false);
          setSelectedCustomerId(null);
          setSelectedServiceId(null);
          setPendingDateTime(null);
          setCustomerPickList(null);
          setServicePickList(null);
          serviceBootstrapRef.current = false;
          setInput("");
          return;
        }
        setMessages((prev) => [
          ...prev,
          userLine,
          {
            role: "assistant",
            content:
              "Zurück zur Dienstauswahl. Wählen Sie erneut einen Dienst oder filtern Sie die Liste.",
          },
        ]);
        setReservationStep("service");
        setSelectedServiceId(null);
        setPendingDateTime(null);
        setServicePickList(null);
        serviceBootstrapRef.current = false;
        setInput("");
        return;
      }
      if (reservationStep === "service") {
        setMessages((prev) => [
          ...prev,
          userLine,
          {
            role: "assistant",
            content:
              "Zurück zur Kundenauswahl. Geben Sie einen anderen Namen ein oder suchen Sie erneut.",
          },
        ]);
        setReservationStep("customer");
        setSelectedServiceId(null);
        setServicePickList(null);
        setSelectedCustomerId(null);
        setCustomerPickList(null);
        serviceBootstrapRef.current = false;
        setInput("");
        return;
      }
    }

    // ——— Selbstbuchung: skip Kunde und Dienst ———
    if (
      reservationStep === "customer" &&
      chatProviderId &&
      /^(selbst|selbstbuchung|0|self)$/i.test(trimmed)
    ) {
      setSelfReservation(true);
      setSelectedCustomerId(chatProviderId);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        {
          role: "assistant",
          content:
            "Selbstbuchung — Sie blockieren die Zeit für sich selbst (wie im Kalender). Geben Sie nun Datum und Uhrzeit ein.",
        },
        { role: "assistant", content: DATETIME_INSTRUCTION },
      ]);
      setInput("");
      setReservationStep("datetime");
      return;
    }

    // ——— Confirm booking ———
    if (
      reservationStep === "confirm" &&
      pendingDateTime &&
      chatProviderId &&
      (selfReservation || selectedServiceId)
    ) {
      const t = trimmed.toLowerCase();
      if (
        t === "yes" ||
        t === "y" ||
        t === "ja" ||
        t === "ok" ||
        t === "j" ||
        t === "bestätigen" ||
        t === "bestaetigen"
      ) {
        if (!selectedCustomerId) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "Für die Buchung fehlt der Kunde. Bitte starten Sie die Abfrage erneut.",
            },
          ]);
          return;
        }
        setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
        setInput("");
        setLoading(true);
        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              confirmBooking: true,
              dateTime: pendingDateTime,
              providerId: chatProviderId,
              customerId: selectedCustomerId,
              ...(selfReservation
                ? { selfReservation: true }
                : { serviceId: selectedServiceId }),
            }),
          });
          let data: { message?: string; success?: boolean } = {};
          try {
            data = (await res.json()) as typeof data;
          } catch {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: FALLBACK_REPLY },
            ]);
            return;
          }
          const reply = replyText(data.message);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: reply,
            },
          ]);
          if (data.success === true) {
            setPendingDateTime(null);
            setReservationStep("complete");
            if (typeof window !== "undefined" && chatProviderId) {
              window.dispatchEvent(
                new CustomEvent(CALENDAR_APPOINTMENT_CREATED_EVENT, {
                  detail: { providerId: chatProviderId },
                }),
              );
            }
            void queryClient.invalidateQueries({ queryKey: ["getAppointments"] });
            void queryClient.invalidateQueries({ queryKey: ["user-time-slots"] });
            void queryClient.invalidateQueries({ queryKey: ["getSchedule"] });
          }
        } finally {
          setLoading(false);
        }
        return;
      }
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setInput("");
      setPendingDateTime(null);
      setReservationStep("datetime");
      await runDateTimeCheck(trimmed);
      return;
    }

    // ——— Check date/time ———
    if (
      reservationStep === "datetime" &&
      chatProviderId &&
      (selfReservation || selectedServiceId)
    ) {
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setInput("");
      await runDateTimeCheck(trimmed);
      return;
    }

    // ——— Service pick by number ———
    if (reservationStep === "service" && servicePickList?.length) {
      if (/^\d+$/.test(trimmed)) {
        const n = parseInt(trimmed, 10);
        if (n >= 1 && n <= servicePickList.length) {
          const picked = servicePickList[n - 1];
          setMessages((prev) => [
            ...prev,
            { role: "user", content: trimmed },
            {
              role: "assistant",
              content: `Sie haben Dienst ${n} gewählt. Dieser Dienst wird für die Buchung verwendet.`,
            },
          ]);
          setInput("");
          setServicePickList(null);
          beginDatetimeStep(picked.id);
          return;
        }
        setMessages((prev) => [
          ...prev,
          { role: "user", content: trimmed },
          {
            role: "assistant",
            content: `Bitte eine Zahl zwischen 1 und ${servicePickList.length} eingeben, oder Suchwörter zum Filtern.`,
          },
        ]);
        setInput("");
        return;
      }
      setServicePickList(null);
    }

    // ——— Customer pick by number ———
    if (reservationStep === "customer" && customerPickList?.length) {
      if (/^\d+$/.test(trimmed)) {
        const n = parseInt(trimmed, 10);
        if (n >= 1 && n <= customerPickList.length) {
          const selected = customerPickList[n - 1];
          setSelectedCustomerId(selected.id);
          setMessages((prev) => [
            ...prev,
            { role: "user", content: trimmed },
            {
              role: "assistant",
              content: `Sie haben Kunde ${n} gewählt: ${customerLabel(selected)}. Dienste werden geladen…`,
            },
          ]);
          setInput("");
          setCustomerPickList(null);
          setReservationStep("service");
          serviceBootstrapRef.current = false;
          return;
        }
        setMessages((prev) => [
          ...prev,
          { role: "user", content: trimmed },
          {
            role: "assistant",
            content: `Bitte eine Zahl zwischen 1 und ${customerPickList.length} eingeben, oder einen neuen Namen suchen.`,
          },
        ]);
        setInput("");
        return;
      }
      setCustomerPickList(null);
    }

    // ——— Service text filter (client-side, same list as GET /service) ———
    if (reservationStep === "service") {
      const base = fullServiceList;
      if (!chatProviderId) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Bitte zuerst /dashboard/service/… aufrufen oder ?providerId=… setzen.",
          },
        ]);
        setInput("");
        return;
      }
      if (!base || base.length === 0) {
        setMessages((prev) => [
          ...prev,
          { role: "user", content: trimmed },
          {
            role: "assistant",
            content:
              servicesQuery.isPending || !servicesQuery.data
                ? "Dienste werden geladen…"
                : "Für diesen Anbieter sind noch keine Dienste verfügbar.",
          },
        ]);
        setInput("");
        return;
      }

      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setInput("");

      const words = trimmed
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 0);

      const filtered =
        words.length === 0
          ? base
          : base.filter((row) =>
              words.every((w) => row.line.toLowerCase().includes(w)),
            );

      setServicePickList(filtered);

      if (filtered.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Kein Dienst passt zur Suche. Andere oder weniger Suchwörter versuchen.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            filtered.length === 1
              ? "Ein Treffer — **1** zum Wählen, oder Suche verfeinern."
              : `Passende Dienste — antworten Sie mit **1–${filtered.length}**, oder neue Wörter eingeben.`,
          alternatives: filtered.map((r) => r.line),
        },
      ]);
      return;
    }

    // ——— Customer name search ———
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: trimmed }),
      });

      let data: {
        message?: string;
        alternatives?: string[];
        success?: boolean;
        found?: boolean;
        customers?: unknown;
      } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: FALLBACK_REPLY },
        ]);
        return;
      }

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: replyText(data.message) },
        ]);
        return;
      }

      if (data.success !== true) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: replyText(data.message) },
        ]);
        return;
      }

      const altCount = data.alternatives?.length ?? 0;
      const hasMultipleMatches = altCount > 1;
      const customersFromApi = parseCustomers(data.customers);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: replyText(data.message),
          alternatives: data.alternatives,
        },
      ]);

      if (
        hasMultipleMatches &&
        customersFromApi &&
        customersFromApi.length > 1
      ) {
        setCustomerPickList(customersFromApi);
        return;
      }

      setCustomerPickList(null);

      const singleClearMatch =
        data.found === true && !hasMultipleMatches && altCount <= 1;
      if (singleClearMatch && customersFromApi?.length === 1) {
        setSelectedCustomerId(customersFromApi[0].id);
        setReservationStep("service");
        serviceBootstrapRef.current = false;
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: FALLBACK_REPLY },
      ]);
    } finally {
      setLoading(false);
    }
  }, [
    input,
    loading,
    reservationStep,
    customerPickList,
    servicePickList,
    pendingDateTime,
    selectedServiceId,
    selectedCustomerId,
    beginDatetimeStep,
    runDateTimeCheck,
    chatProviderId,
    fullServiceList,
    servicesQuery.isPending,
    servicesQuery.data,
    queryClient,
    selfReservation,
  ]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  let placeholder = "Kundenname, **selbst** oder **zurück**…";
  if (reservationStep === "confirm") {
    placeholder = "**ja** zur Bestätigung, neues Datum oder **zurück**";
  } else if (reservationStep === "datetime") {
    placeholder =
      "Datum/Uhrzeit oder **zurück** — z. B. 2026-04-21 10:00 00:30";
  } else if (reservationStep === "service") {
    if (servicePickList?.length) {
      placeholder = `1–${servicePickList.length} wählen oder **zurück**…`;
    } else {
      placeholder = "Suchwörter oder **zurück**…";
    }
  } else if (customerPickList?.length) {
    placeholder = `1–${customerPickList.length} wählen oder **zurück**…`;
  } else if (reservationStep === "complete") {
    placeholder = "**zurück** für neue Buchung…";
  }

  const showTyping =
    loading ||
    (reservationStep === "service" &&
      Boolean(chatProviderId) &&
      servicesQuery.isPending);

  const typingLabel =
    reservationStep === "service" &&
    Boolean(chatProviderId) &&
    servicesQuery.isPending
      ? "Dienste werden geladen…"
      : loading &&
          (reservationStep === "datetime" || reservationStep === "confirm")
        ? "Bitte warten…"
        : "Suche…";

  return (
    <div ref={rootRef} className={styles.root} aria-live="polite">
      {panelVisible && (
        <div
          className={`${styles.panel} ${open ? styles.panelOpen : styles.panelClosed}`}
          role="dialog"
          aria-modal="false"
          aria-label="Termin-Chat"
        >
          <header className={styles.header}>
            <h2 className={styles.title}>Termin-Assistent</h2>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={minimizeChat}
                aria-label="Einklappen (Chat bleibt gespeichert)"
                title="Minimieren"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M5 12h14" />
                </svg>
              </button>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={closeAndClearChat}
                aria-label="Schließen und Chat löschen"
                title="Schließen"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          <div className={styles.messages}>
            {messages.length === 0 && !showTyping && (
              <div className={`${styles.row} ${styles.rowBot}`}>
                <div className={`${styles.bubble} ${styles.bubbleBot}`}>
                  Kunde suchen, Dienst wählen, Datum/Uhrzeit — oder **selbst** / **0** für Selbstbuchung
                  (wie im Kalender). Bestätigung mit **ja**. Mit **zurück** oder **back** einen Schritt
                  zurück.
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={`${i}-${m.role}-${m.content.slice(0, 24)}`}
                className={`${styles.row} ${m.role === "user" ? styles.rowUser : styles.rowBot}`}
              >
                <div
                  className={`${styles.bubble} ${m.role === "user" ? styles.bubbleUser : styles.bubbleBot}`}
                >
                  {m.content}
                  {m.role === "assistant" &&
                    m.alternatives &&
                    m.alternatives.length > 0 && (
                      <ol className={styles.choiceList}>
                        {m.alternatives.map((slot, j) => (
                          <li key={`${slot}-${j}`}>{slot}</li>
                        ))}
                      </ol>
                    )}
                </div>
              </div>
            ))}
            {showTyping && (
              <div className={`${styles.row} ${styles.rowBot}`}>
                <div className={`${styles.bubble} ${styles.bubbleBot}`}>
                  <span className={styles.typing}>{typingLabel}</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className={styles.footer}>
            <div className={styles.form}>
              <input
                ref={inputRef}
                id="chat-widget-input"
                className={styles.input}
                type="text"
                inputMode="text"
                autoComplete="off"
                placeholder={placeholder}
                value={input}
                disabled={
                  loading ||
                  (reservationStep === "service" &&
                    Boolean(chatProviderId) &&
                    servicesQuery.isPending)
                }
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                aria-label="Chat-Eingabe"
              />
              <button
                type="button"
                className={styles.sendBtn}
                onClick={() => void send()}
                disabled={
                  loading ||
                  !input.trim() ||
                  (reservationStep === "service" &&
                    Boolean(chatProviderId) &&
                    servicesQuery.isPending)
                }
              >
                {reservationStep === "complete" ? "Fertig" : "Senden"}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.toggleBtn}
        onClick={toggleOpen}
        aria-expanded={open}
        aria-label={
          open
            ? "Termin-Chat einklappen (Inhalt bleibt)"
            : "Termin-Chat öffnen"
        }
      >
        <svg
          className={styles.toggleIcon}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
          <path d="M7 9h10v2H7zm0-3h10v2H7z" />
        </svg>
      </button>
    </div>
  );
}

export default function ChatWidget() {
  return (
    <Suspense fallback={null}>
      <ChatWidgetInner />
    </Suspense>
  );
}
