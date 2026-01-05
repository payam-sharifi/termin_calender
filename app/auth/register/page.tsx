'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROLE, SEX } from '@/services/userApi/user.types';
import { register, sendOtp } from '@/services/auth';
import OtpModal from './OtpModal';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    family: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    sex: SEX.male,
  });
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [otpError, setOtpError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'phone') {
      // Auto-format phone number
      if (newValue.startsWith('+49')) {
        newValue = '+49' + newValue.slice(3);
      } else if (newValue.startsWith('0') && !newValue.startsWith('+49')) {
        newValue = '+49' + newValue.slice(1);
      } else if (!newValue.startsWith('+49')) {
        // Optionally, do not auto-prepend here, only on blur/submit
      }
    }
    setForm({ ...form, [name]: newValue });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (name === 'password' || name === 'confirmPassword') {
      if (errors.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handlePhoneBlur = () => {
    let phone = form.phone.trim();
    if (phone.startsWith('+49')) {
      phone = '+49' + phone.slice(3);
    } else if (phone.startsWith('0') && !phone.startsWith('+49')) {
      phone = '+49' + phone.slice(1);
    } else if (!phone.startsWith('+49')) {
      phone = '+49' + phone;
    }
    setForm((prev) => ({ ...prev, phone }));
  };

  const handleSexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, sex: e.target.value as SEX });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name) newErrors.name = 'Vorname ist erforderlich.';
    if (!form.family) newErrors.family = 'Nachname ist erforderlich.';
    if (!form.email) newErrors.email = 'E-Mail ist erforderlich.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Ungültige E-Mail-Adresse.';
    if (!form.phone) {
      newErrors.phone = 'Telefon ist erforderlich.';
    } else if (!/^\+49\d{7,15}$/.test(form.phone)) {
      newErrors.phone = 'Bitte geben Sie eine gültige deutsche Telefonnummer im Format +49... ein.';
    }
    if (!form.password) newErrors.password = 'Passwort ist erforderlich.';
    if (form.password.length < 6) newErrors.password = 'Das Passwort muss mindestens 6 Zeichen lang sein.';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwörter stimmen nicht überein.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpError('');
    if (!validate()) return;
    setOtpLoading(true);
    try {
      await sendOtp({ phone: form.phone });
      setOtpModalOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fehler beim Senden des OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpSubmit = async (code: string) => {
    setRegisterLoading(true);
    setOtpError('');
    try {
    const res = await register({
        name: form.name,
        family: form.family,
        email: form.email,
        phone: form.phone,
        password: form.password,
        sex: form.sex,
        code,
        role: ROLE.Customer,
        is_verified:true
      });
      
      setSuccess(true);
      toast.success(res.message)
      setOtpModalOpen(false);
      setTimeout(() => router.push('/auth/login'), 1000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registrierung fehlgeschlagen';
      // Ensure error is a string
      const errorString = typeof errorMessage === 'string' ? errorMessage : 'Registrierung fehlgeschlagen';
      toast.error(errorString);
      setOtpError(errorString);
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
  <div className="m-4"style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
    <div className='shadow p-4 ' style={{width:"80vw "}} >
      <h2 className="text-center">Registrieren</h2>
      <form onSubmit={handleRegister} noValidate>
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Vorname</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">Nachname</label>
              <input
                type="text"
                className={`form-control ${errors.family ? 'is-invalid' : ''}`}
                name="family"
                value={form.family}
                onChange={handleChange}
                required
              />
              {errors.family && <div className="invalid-feedback">{errors.family}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">E-Mail</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">Telefon</label>
              <input
                type="tel"
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                name="phone"
                value={form.phone}
                onChange={handleChange}
                onBlur={handlePhoneBlur}
                required
              />
              {errors.phone && <div className="text-danger mt-1" style={{ fontSize: '0.875em' }}>{errors.phone}</div>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Passwort</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">Passwort bestätigen</label>
              <input
                type="password"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">Geschlecht</label>
              <div>
                <label style={{ marginRight: 10 }}>
                  <input
                    type="radio"
                    name="sex"
                    value={SEX.male}
                    checked={form.sex === SEX.male}
                    onChange={handleSexChange}
                  /> Männlich
                </label>
                <label style={{ marginRight: 10 }}>
                  <input
                    type="radio"
                    name="sex"
                    value={SEX.female}
                    checked={form.sex === SEX.female}
                    onChange={handleSexChange}
                  /> Weiblich
                </label>
              </div>
            </div>
          </div>
        </div>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        {/* {success && <div className="alert alert-success mt-3">Erfolgreich registriert! Weiterleitung...</div>} */}
        <button type="submit" className="btn btn-primary w-100 mt-3" disabled={otpLoading}>Registrieren</button>
      </form>
      <OtpModal
        open={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onSubmit={handleOtpSubmit}
        phone={form.phone}
        loading={registerLoading}
        error={otpError}
      />
      <div className="mt-3 text-center">
        Bereits ein Konto? <a href="/auth/login">Login</a>
      </div>
    </div>
    </div>
  );
} 