import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLogin } from '@/services/hooks/auth/useLogin';
import { toast } from "react-toastify";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
// const {mutate:loginUser,isSuccess,isError,data}=useLogin()

 const { mutate: login, isPending } = useLogin();

const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  login(
    { phone, password },
    {
      onSuccess: (res) => {
        console.log(res,"rrrr")
        if (res?.success) {
          toast.success(res.message);
          localStorage.setItem('termin-token', res.data);
          router.push(`/service/${res.data}`);
        } else {
          toast.error(res.message);
        }
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Login fehlgeschlagen";
        toast.error(message);
        setError(message);
      },
    }
  );
};
 
  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        {/* <div className="mb-3">
          <label htmlFor="email" className="form-label">E-Mail</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div> */}
        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Phone</label>
          <input
            type="phone"
            className="form-control"
            id="phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
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
        {error && (
          <div className="alert alert-danger">
            {typeof error === 'string' ? error : (error as any)?.message}
          </div>
        )}
        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
      <div className="mt-3 text-center">
        Noch kein Konto? <Link href="/auth/register">Registrieren</Link>
      </div>
    </div>
  );
} 