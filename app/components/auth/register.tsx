import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROLE, SEX } from '@/services/userApi/user.types';
import { createUser } from '@/services/userApi';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    family: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createUser({ ...form, role: ROLE.Customer, is_verified: false, sex: SEX.male });
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrierung fehlgeschlagen');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Registrieren</h2>
      <form onSubmit={handleRegister}>
        <div className="mb-3">
          <label className="form-label">Vorname</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Nachname</label>
          <input
            type="text"
            className="form-control"
            name="family"
            value={form.family}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">E-Mail</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Telefon</label>
          <input
            type="tel"
            className="form-control"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Passwort</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">Erfolgreich registriert! Weiterleitung...</div>}
        <button type="submit" className="btn btn-primary w-100">Registrieren</button>
      </form>
      <div className="mt-3 text-center">
        Bereits ein Konto? <a href="/auth/login">Login</a>
      </div>
    </div>
  );
} 