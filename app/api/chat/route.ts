import { NextResponse } from "next/server";

/** Nest API base URL (default port 4001). Next.js runs on 7500 — see package.json. */
function getBackendBaseUrl(): string {
  const fromEnv =
    process.env.API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, "");
  }
  return "http://localhost:4001";
}

type AgentBody = {
  customerName?: unknown;
  serviceQuery?: unknown;
  providerId?: unknown;
  dateTime?: unknown;
  serviceId?: unknown;
  confirmBooking?: unknown;
  customerId?: unknown;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function extractMessage(raw: Record<string, unknown>): string {
  const top = raw.message;
  if (typeof top === "string" && top.trim()) return top;
  if (top && typeof top === "object" && top !== null && "message" in top) {
    const inner = (top as { message?: unknown }).message;
    if (typeof inner === "string" && inner.trim()) return inner;
    if (Array.isArray(inner)) return inner.map(String).join(" ");
  }
  return "";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body", success: false },
      { status: 400 },
    );
  }

  const obj = body as AgentBody;
  let payload: Record<string, unknown>;

  if (
    obj.confirmBooking === true &&
    typeof obj.dateTime === "string" &&
    isNonEmptyString(obj.serviceId) &&
    obj.customerId &&
    obj.providerId
  ) {
    payload = {
      confirmBooking: true,
      dateTime: obj.dateTime.trim(),
      serviceId: String(obj.serviceId).trim(),
      customerId: String(obj.customerId).trim(),
      providerId: String(obj.providerId).trim(),
    };
  } else if (
    typeof obj.dateTime === "string" &&
    isNonEmptyString(obj.serviceId) &&
    isNonEmptyString(obj.providerId)
  ) {
    payload = {
      dateTime: obj.dateTime,
      serviceId: String(obj.serviceId).trim(),
      providerId: String(obj.providerId).trim(),
    };
  } else if (typeof obj.serviceQuery === "string") {
    payload = { serviceQuery: obj.serviceQuery };
    if (typeof obj.providerId === "string" && obj.providerId.trim()) {
      payload.providerId = obj.providerId.trim();
    }
  } else if (obj.customerName !== undefined) {
    if (!isNonEmptyString(obj.customerName)) {
      return NextResponse.json(
        { message: "Customer name cannot be empty.", success: false },
        { status: 400 },
      );
    }
    payload = { customerName: obj.customerName.trim() };
  } else {
    return NextResponse.json(
      {
        message:
          "Send customerName, serviceQuery, dateTime+serviceId+providerId, or confirmBooking with dateTime, serviceId, customerId, providerId.",
        success: false,
      },
      { status: 400 },
    );
  }

  const backendUrl = `${getBackendBaseUrl()}/api/chat`;

  try {
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let raw: Record<string, unknown> = {};
    try {
      raw = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      return NextResponse.json(
        {
          message:
            "The booking service returned an unexpected response. Please try again shortly.",
          success: false,
        },
        { status: 502 },
      );
    }

    const message =
      extractMessage(raw) ||
      (res.ok
        ? "OK"
        : "The booking assistant could not complete this request.");

    const success = raw.success === true;
    const found = raw.found === true;
    const slotFree = raw.slotFree === true;
    const step =
      raw.step === "service" ||
      raw.step === "customer" ||
      raw.step === "datetime" ||
      raw.step === "done"
        ? raw.step
        : undefined;

    const alternatives = Array.isArray(raw.alternatives)
      ? (raw.alternatives as unknown[]).filter(
          (x): x is string => typeof x === "string"
        )
      : undefined;
    const customers = raw.customers;
    const services = raw.services;
    const slotId = typeof raw.slotId === "string" ? raw.slotId : undefined;
    const requestedStartBerlin =
      typeof raw.requestedStartBerlin === "string"
        ? raw.requestedStartBerlin
        : undefined;
    const nearestStartBerlin =
      typeof raw.nearestStartBerlin === "string"
        ? raw.nearestStartBerlin
        : undefined;

    return NextResponse.json(
      {
        message,
        success,
        found,
        slotFree,
        step,
        alternatives,
        customers,
        services,
        slotId,
        requestedStartBerlin,
        nearestStartBerlin,
      },
      { status: res.status },
    );
  } catch {
    return NextResponse.json(
      {
        message:
          "We could not reach the booking assistant. Check your connection and try again.",
        success: false,
      },
      { status: 503 },
    );
  }
}
