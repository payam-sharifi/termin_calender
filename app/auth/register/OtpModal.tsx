import React, { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from 'react';

interface OtpModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
  phone: string;
  loading?: boolean;
  error?: string;
}

const OtpModal: React.FC<OtpModalProps> = ({ open, onClose, onSubmit, phone, loading, error }) => {
  const [otp, setOtp] = useState<string[]>(new Array(4).fill(''));
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (open) {
      setOtp(new Array(4).fill(''));
      setLocalError('');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    if (value.length > 1) { // Handle paste
      const digits = value.split('');
      digits.forEach((digit, i) => {
        if (index + i < newOtp.length) {
          newOtp[index + i] = digit;
        }
      });
      const nextFocusIndex = Math.min(index + digits.length - 1, newOtp.length - 1);
      otpInputRefs.current[nextFocusIndex]?.focus();
    } else {
      newOtp[index] = value;
      if (value && index < newOtp.length - 1) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
    setOtp(newOtp);
    setLocalError('');
  };

  const handleOtpKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 4) {
      setLocalError('OTP-Code ist erforderlich und muss 4-stellig sein.');
      return;
    }
    onSubmit(code);
  };

  if (!open) return null;

  return (
    <div className="modal show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">OTP-Code eingeben</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body text-center">
              <p>Wir haben einen Code an <b>{phone}</b> gesendet.</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: 16 }}>
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    name="otp"
                    className={`form-control text-center ${localError || error ? 'is-invalid' : ''}`}
                    style={{ width: '3rem', fontSize: '1.5rem' }}
                    maxLength={1}
                    value={data}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    ref={(el) => { otpInputRefs.current[index] = el; }}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
              {(localError || error) && <div className="invalid-feedback d-block">{localError || error}</div>}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Abbrechen</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Überprüfen...' : 'Bestätigen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpModal; 