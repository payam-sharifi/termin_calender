import { NextResponse } from "next/server";

type ChatTurn = { role: "user" | "assistant" | "system"; content: string };

function getBackendBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, "");
  }
  return "http://localhost:4001";
}

/**
 * Proxies chat to the Nest backend POST /chat (expects { messages: [...] }).
 * Accepts either `messages` (full history) or a single `message` string (one user turn).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const obj = body as {
    message?: unknown;
    messages?: unknown;
  };

  let messages: ChatTurn[];

  if (Array.isArray(obj.messages) && obj.messages.length > 0) {
    messages = obj.messages as ChatTurn[];
  } else if (typeof obj.message === "string" && obj.message.trim().length > 0) {
    messages = [{ role: "user", content: obj.message.trim() }];
  } else {
    return NextResponse.json(
      {
        error:
          "Provide `message` (string) or non-empty `messages` array for the assistant.",
      },
      { status: 400 },
    );
  }

  const backendUrl = `${getBackendBaseUrl()}/chat`;

  try {
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    const text = await res.text();
    let data: { message?: string; alternatives?: string[] } = {};
    try {
      data = text ? (JSON.parse(text) as typeof data) : {};
    } catch {
      return NextResponse.json(
        {
          message:
            "The booking service returned an unexpected response. Please try again shortly.",
        },
        { status: 502 },
      );
    }

    if (!res.ok) {
      const errMsg =
        typeof data.message === "string" && data.message
          ? data.message
          : "The booking assistant could not complete this request.";
      return NextResponse.json({ message: errMsg }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        message:
          "We could not reach the booking assistant. Check your connection and try again.",
      },
      { status: 503 },
    );
  }
}
