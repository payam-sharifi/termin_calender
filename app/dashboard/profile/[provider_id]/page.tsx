"use client";

import { use, useEffect, useState } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useGetOneUser } from "@/services/hooks/user/useGetOneuser";
import { useUpdateUser } from "@/services/hooks/user/useUpdateUser";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { UpdateUserRqDataType } from "@/services/userApi/user.types";

const isValidGermanMobile = (num: string) => /^\+49[1-9][0-9]{9,13}$/.test(num);

export default function ProviderProfilePage({
  params,
}: {
  params: Promise<{ provider_id: string }>;
}) {
  const { provider_id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useGetOneUser({ id: provider_id });
  const { mutate: updateUser, isPending } = useUpdateUser();

  const [name, setName] = useState("");
  const [family, setFamily] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("termin-token");
    if (!token) return;
    try {
      const decoded = jwtDecode<{ id: string }>(token);
      if (decoded.id !== provider_id) {
        router.replace(`/dashboard/profile/${decoded.id}`);
      }
    } catch {
      router.replace("/auth/login");
    }
  }, [provider_id, router]);

  useEffect(() => {
    const u = data?.data;
    if (!u) return;
    setName(u.name ?? "");
    setFamily(u.family ?? "");
    setEmail(u.email ?? "");
    let p = u.phone || "";
    if (p && !p.startsWith("+49")) {
      p = "+49" + p.replace(/^\+*/, "");
    }
    setPhone(p);
    setNewPassword("");
    setConfirmPassword("");
    setFieldErrors({});
  }, [data?.data]);

  const handlePhoneChange = (value: string) => {
    let val = value.replace(/^0+/, "");
    if (!val.startsWith("+49")) {
      val = "+49" + val.replace(/^\+*/, "");
    }
    setPhone(val);
    if (fieldErrors.phone) setFieldErrors((e) => ({ ...e, phone: "" }));
  };

  const validate = () => {
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = "Vorname ist erforderlich.";
    if (!family.trim()) err.family = "Nachname ist erforderlich.";
    if (email && !/\S+@\S+\.\S+/.test(email)) err.email = "Ungültige E-Mail.";
    if (!phone || !isValidGermanMobile(phone)) {
      err.phone = "Bitte gültige Handynummer mit +49 eingeben.";
    }
    if (newPassword || confirmPassword) {
      if (newPassword.length < 5 || newPassword.length > 12) {
        err.newPassword = "Passwort: 5–12 Zeichen.";
      }
      if (newPassword !== confirmPassword) {
        err.confirmPassword = "Passwörter stimmen nicht überein.";
      }
    }
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: UpdateUserRqDataType = {
      id: provider_id,
      name: name.trim(),
      family: family.trim(),
      email: email.trim() || null,
      phone,
    };
    if (newPassword) payload.password = newPassword;

    updateUser(payload, {
      onSuccess: () => {
        toast.success("Profil gespeichert.");
        queryClient.invalidateQueries({ queryKey: ["user", provider_id] });
        setNewPassword("");
        setConfirmPassword("");
      },
      onError: (error: unknown) => {
        const ax = error as { response?: { data?: { message?: string } } };
        toast.error(ax?.response?.data?.message ?? "Speichern fehlgeschlagen.");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="termin-profile-surface termin-loading-screen">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Laden…</span>
        </Spinner>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="termin-profile-surface">
        <Container className="py-4">
          <p style={{ color: "#9b2335" }}>Profil konnte nicht geladen werden.</p>
          <Button variant="primary" onClick={() => router.back()}>
            Zurück
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="termin-profile-surface">
      <Container className="py-4" style={{ maxWidth: 560 }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <Button variant="outline-primary" onClick={() => router.push(`/dashboard/service/${provider_id}`)}>
            Zurück zum Kalender
          </Button>
          <h1 className="fs-5 fs-md-4 mb-0">Mein Profil</h1>
        </div>

        <div className="p-3 rounded termin-profile-card">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Vorname</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((x) => ({ ...x, name: "" }));
              }}
              isInvalid={!!fieldErrors.name}
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.name}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nachname</Form.Label>
            <Form.Control
              value={family}
              onChange={(e) => {
                setFamily(e.target.value);
                if (fieldErrors.family) setFieldErrors((x) => ({ ...x, family: "" }));
              }}
              isInvalid={!!fieldErrors.family}
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.family}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>E-Mail</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((x) => ({ ...x, email: "" }));
              }}
              isInvalid={!!fieldErrors.email}
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Handy (Mobilnummer)</Form.Label>
            <Form.Control
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+491234567890"
              isInvalid={!!fieldErrors.phone}
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.phone}</Form.Control.Feedback>
          </Form.Group>

          <hr />
          <p className="text-muted small mb-3">Neues Passwort nur ausfüllen, wenn Sie es ändern möchten.</p>

          <Form.Group className="mb-3">
            <Form.Label>Neues Passwort</Form.Label>
            <Form.Control
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (fieldErrors.newPassword) setFieldErrors((x) => ({ ...x, newPassword: "" }));
              }}
              isInvalid={!!fieldErrors.newPassword}
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.newPassword}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Neues Passwort bestätigen</Form.Label>
            <Form.Control
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) setFieldErrors((x) => ({ ...x, confirmPassword: "" }));
              }}
              isInvalid={!!fieldErrors.confirmPassword}
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.confirmPassword}</Form.Control.Feedback>
          </Form.Group>

          <Button type="submit" variant="primary" disabled={isPending} className="w-100">
            {isPending ? "Speichern…" : "Speichern"}
          </Button>
        </Form>
        </div>
      </Container>
    </div>
  );
}
