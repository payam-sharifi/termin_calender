'use client'
import {  useEffect, useState } from 'react';
import Link from 'next/link';
import { useLogin } from '@/services/hooks/auth/useLogin';
import { toast } from "react-toastify";
import { jwtDecode } from 'jwt-decode';
import { useSendOtp } from '@/services/hooks/auth/useSendOtp';
import { useRouter } from 'next/navigation';
export default function LoginPage() {
  const router=useRouter()
  const [loginMethod, setLoginMethod] = useState<'password' | 'sms'>('password');
  const [phone, setPhone] = useState('');

  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId,setUserId]=useState('')

 const { mutate: login, isPending } = useLogin();

const {mutate: sendOtp, isPending:otpPending }=useSendOtp()

 useEffect(()=>{
 if(userId){
   router.push(`/dashboard/service/${userId}`)
 }
 },[userId])

const jwtToken= (tokenrq:string)=>{
  const token = typeof tokenrq === 'string' ? tokenrq : tokenrq;
  const decoded = jwtDecode<{ id: string }>(token);
          localStorage.setItem('termin-token', token);
          document.cookie = `termin-token=${token}; path=/; max-age=2592000`;
          setUserId(decoded.id)
          router.push(`/dashboard/service/${decoded.id}`);
}

const [fieldErrors, setFieldErrors] = useState<{ phone?: string; password?: string; code?: string }>({});

// German mobile validation
const isValidGermanMobile = (num: string) => /^\+49[1-9][0-9]{9,13}$/.test(num);

// Validate fields
const validateFields = (fields: { phone?: string; password?: string; code?: string }, method: 'password' | 'sms', codeSent: boolean) => {
  const errors: { phone?: string; password?: string; code?: string } = {};
  if (!fields.phone || !isValidGermanMobile(fields.phone)) {
    errors.phone = 'Bitte geben Sie eine gültige deutsche Handynummer mit +49 ein';
  }
  if (method === 'password') {
    if (!fields.password) {
      errors.password = 'Passwort ist erforderlich';
    }
  } else if (method === 'sms' && codeSent) {
    if (!fields.code || fields.code.length !== 4) {
      errors.code = 'Bitte geben Sie den 4-stelligen Code ein';
    }
  }
  return errors;
};

// Clear error for a field on change
const clearFieldError = (field: keyof typeof fieldErrors) => {
  if (fieldErrors[field]) {
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));
  }
};

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  const errors = validateFields({ phone, password }, 'password', false);
  setFieldErrors(errors);
  if (Object.keys(errors).length > 0) return;
  setLoading(true);
  login(
    { phone, password },
    {
      onSuccess: (res) => {
          toast.success(res.message);
          jwtToken(res.data)
      },
      onError: (error: any) => {
        toast.error("Login fehlgeschlagen");
      },
    }
  );
  setLoading(false);
};

const handleSendCode = async (e: React.FormEvent) => {
  e.preventDefault();
  const errors = validateFields({ phone }, 'sms', false);
  setFieldErrors(errors);
  if (Object.keys(errors).length > 0) return;
  setLoading(true);
  sendOtp(
    { phone },
    {
      onSuccess: (res) => {
        toast.success(res.message);
        setCodeSent(true);
        setLoading(false);
        jwtToken(res.data)
      },
      onError: (error: any) => {
        toast.error("Fehler beim Senden des Codes");
        setLoading(false);
      }
    }
  );
};

const handleVerifyCode = async (e: React.FormEvent) => {
  e.preventDefault();
  const errors = validateFields({ phone, code }, 'sms', true);
  setFieldErrors(errors);
  if (Object.keys(errors).length > 0) return;
  setLoading(true);
  login(
    { phone, code },
    {
      onSuccess: (res) => {
          toast.success(res.message);
          jwtToken(res.data)
      },
      onError: (error: any) => {
        toast.error( "Login fehlgeschlagen");
      },
    }
  );
};

const handleTabChange = (method: 'password' | 'sms') => {
  setLoginMethod(method);

  setLoading(false);
  setCodeSent(false);
  setPassword('');
  setCode('');
};

const [codeDigits, setCodeDigits] = useState(['', '', '', '']);

const handleCodeChange = (index: number, value: string) => {
  if (!/^[0-9]?$/.test(value)) return; // Only allow single digit
  const newDigits = [...codeDigits];
  newDigits[index] = value;
  setCodeDigits(newDigits);

  // Move to next input if filled
  if (value && index < 3) {
    const nextInput = document.getElementById(`code-digit-${index + 1}`);
    if (nextInput) nextInput.focus();
  }
  // Update code string for backend
  setCode(newDigits.join(''));
};

const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
  const paste = e.clipboardData.getData('text').replace(/\\D/g, '').slice(0, 4);
  if (paste.length === 4) {
    setCodeDigits(paste.split(''));
    setCode(paste);
  }
};

// Add computed variable for phone validity
const isPhoneValid = isValidGermanMobile(phone);
const isPasswordValid = password.length > 0;

  return (
    <div className="termin-auth-shell">
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 16px' }}>
        <div className="termin-auth-card" style={{ maxWidth: 400 }}>
          <h2 className="text-center" style={{ fontSize: 32, marginBottom: 32 }}>Login</h2>
      <div className="termin-auth-tabs">
        <button
          type="button"
          className={`w-50${loginMethod === 'password' ? ' active' : ''}`}
          onClick={() => handleTabChange('password')}
        >
          Passwort
        </button>
        <button
          type="button"
          className={`w-50${loginMethod === 'sms' ? ' active' : ''}`}
          onClick={() => handleTabChange('sms')}
        >
          SMS
        </button>
      </div>
      {loginMethod === 'password' && (
            <form onSubmit={handleLogin} autoComplete="off">
          <div className="mb-3">
                <label htmlFor="phone" className="form-label" style={{ fontWeight: 500 }}>Phone</label>
            <input
              type="tel"
              className="form-control"
              id="phone"
              value={phone}
              onChange={e => {
                let val = e.target.value.replace(/^0+/, '');
                if (!val.startsWith('+49')) {
                  val = '+49' + val.replace(/^\+*/, '');
                }
                setPhone(val);
                    clearFieldError('phone');
              }}
              required
                  style={{ borderRadius: 8, fontSize: 16 }}
            />
                {fieldErrors.phone && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>{fieldErrors.phone}</div>}
          </div>
          <div className="mb-3">
                <label htmlFor="password" className="form-label" style={{ fontWeight: 500 }}>Passwort</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
                  onChange={e => { setPassword(e.target.value); clearFieldError('password'); }}
              required
                  style={{ borderRadius: 8, fontSize: 16 }}
            />
                {fieldErrors.password && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>{fieldErrors.password}</div>}
          </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading || !isPhoneValid || !isPasswordValid} style={{ borderRadius: 8, fontSize: 18, padding: '10px 0', marginTop: 8 }}>
            {loading ? 'Einloggen...' : 'Login'}
          </button>
        </form>
      )}
      {loginMethod === 'sms' && (
            <form onSubmit={codeSent ? handleVerifyCode : handleSendCode} autoComplete="off">
          <div className="mb-3">
                <label htmlFor="phone" className="form-label" style={{ fontWeight: 500 }}>Phone</label>
            <input
              type="tel"
              className="form-control"
              id="phone"
              value={phone}
              onChange={e => {
                let val = e.target.value.replace(/^0+/, '');
                if (!val.startsWith('+49')) {
                  val = '+49' + val.replace(/^\+*/, '');
                }
                setPhone(val);
                    clearFieldError('phone');
              }}
              required
              disabled={codeSent}
                  style={{ borderRadius: 8, fontSize: 16 }}
            />
                {fieldErrors.phone && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>{fieldErrors.phone}</div>}
          </div>
          {!codeSent && (
                <button type="submit" className="btn btn-primary w-100" 
                  disabled={loading || !isPhoneValid}
                  style={{ borderRadius: 8, fontSize: 18, padding: '10px 0', marginTop: 8 }}>
              {loading ? 'Sende Code...' : 'Code per SMS senden'}
            </button>
          )}
          {codeSent && (
            <>
              <div className="mb-3 d-flex justify-content-center" style={{ gap: 8 }}>
                {[0, 1, 2, 3].map(i => (
                  <input
                    key={i}
                    id={`code-digit-${i}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : undefined}
                    maxLength={1}
                    className="form-control text-center"
                        style={{ width: 48, fontSize: 24, borderRadius: 8 }}
                    value={codeDigits[i]}
                        onChange={e => { handleCodeChange(i, e.target.value); clearFieldError('code'); }}
                    onPaste={handleCodePaste}
                    required
                    disabled={loading}
                  />
                ))}
              </div>
                  {fieldErrors.code && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 4, textAlign: 'center' }}>{fieldErrors.code}</div>}
                  <button type="submit" className="btn btn-primary w-100" disabled={loading} style={{ borderRadius: 8, fontSize: 18, padding: '10px 0', marginTop: 8 }}>
                {loading ? 'Überprüfe...' : 'Code überprüfen'}
              </button>
              <div className="mt-2 text-center">
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={handleSendCode}
                  disabled={loading}
                      style={{ fontWeight: 500, textDecoration: 'underline', background: 'none', border: 'none', padding: 0, fontSize: 15 }}
                >
                  Code erneut senden
                </button>
              </div>
            </>
          )}
        </form>
      )}
          <div className="mt-3 text-center" style={{ fontSize: 15 }}>
            Noch kein Konto? <Link href="/auth/register" style={{ fontWeight: 500, textDecoration: 'underline' }}>Registrieren</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 