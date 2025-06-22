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

const isValidGermanMobile = (num: string) => /^\+49\d{10,14}$/.test(num);

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

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
 // setError(null);
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

  setLoading(true);
  login(
    { phone,code },
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

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2 className="text-center">Login</h2>
      {/* <div style={{ display: 'flex', marginBottom: 24 }}>
        <button
          type="button"
          className={`btn btn-light w-50${loginMethod === 'password' ? ' active' : ''}`}
          style={{ borderBottom: loginMethod === 'password' ? '2px solid #007bff' : '1px solid #ccc', borderRadius: '8px 0 0 8px' }}
          onClick={() => handleTabChange('password')}
        >
          Passwort
        </button>
        <button
          type="button"
          className={`btn btn-light w-50${loginMethod === 'sms' ? ' active' : ''}`}
          style={{ borderBottom: loginMethod === 'sms' ? '2px solid #007bff' : '1px solid #ccc', borderRadius: '0 8px 8px 0' }}
          onClick={() => handleTabChange('sms')}
        >
          SMS
        </button>
      </div> */}
      {loginMethod === 'password' && (
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="phone" className="form-label">Phone</label>
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
              }}
              required
             
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Passwort</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Einloggen...' : 'Login'}
          </button>
        </form>
      )}
      {loginMethod === 'sms' && (
        <form onSubmit={codeSent ? handleVerifyCode : handleSendCode}>
          <div className="mb-3">
            <label htmlFor="phone" className="form-label">Phone</label>
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
              }}
              required
              disabled={codeSent}
            />
          </div>
          {!codeSent && (
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
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
                    style={{ width: 48, fontSize: 24 }}
                    value={codeDigits[i]}
                    onChange={e => handleCodeChange(i, e.target.value)}
                    onPaste={handleCodePaste}
                    required
                    disabled={loading}
                  />
                ))}
              </div>
           
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Überprüfe...' : 'Code überprüfen'}
              </button>
              <div className="mt-2 text-center">
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={handleSendCode}
                  disabled={loading}
                >
                  Code erneut senden
                </button>
              </div>
            </>
          )}
        </form>
      )}
      <div className="mt-3 text-center">
        Noch kein Konto? <Link href="/auth/register">Registrieren</Link>
      </div>
    </div>
  );
} 