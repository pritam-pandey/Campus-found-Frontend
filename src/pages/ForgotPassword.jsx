import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, PackageSearch } from 'lucide-react';
import { authAPI } from '../api/endpoints';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('mobile'); // 'mobile' → 'reset'
  const [form, setForm] = useState({ mobile: '', code: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [devCode, setDevCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const requestCode = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    try {
      const data = await authAPI.forgotPassword({ mobile: form.mobile });
      setInfo(data.message || 'A code has been sent to your mobile number');
      if (data.devCode) setDevCode(data.devCode);
      setStep('reset');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authAPI.resetPassword(form);
      navigate('/login', { state: { message: 'Password updated. Log in with your new password.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="card p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white">
            {step === 'mobile' ? <PackageSearch size={28} /> : <KeyRound size={28} />}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Forgot password</h1>
            <p className="mt-1 text-sm text-slate-500">
              {step === 'mobile'
                ? 'Enter your registered mobile number and we will text you a 6-digit code'
                : 'Enter the code we sent and choose a new password'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {info && !error && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {info}
          </div>
        )}
        {devCode && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Development mode (no SMS provider configured): your code is <strong>{devCode}</strong>
          </div>
        )}

        {step === 'mobile' ? (
          <form onSubmit={requestCode} className="space-y-4">
            <div>
              <label className="label" htmlFor="mobile">
                Mobile number
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                required
                placeholder="+8801700000002"
                className="input"
                value={form.mobile}
                onChange={handleChange}
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Sending code…' : 'Send code'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            <div>
              <label className="label" htmlFor="code">
                6-digit code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                placeholder="123456"
                className="input tracking-[0.4em]"
                value={form.code}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label" htmlFor="newPassword">
                New password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="input"
                value={form.newPassword}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label" htmlFor="confirmPassword">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="input"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Updating…' : 'Reset password'}
            </button>
            <button
              type="button"
              className="w-full text-center text-sm font-semibold text-primary-600 hover:text-primary-700"
              onClick={() => {
                setStep('mobile');
                setError('');
                setInfo('');
                setDevCode('');
                setForm((f) => ({ ...f, code: '' }));
              }}
            >
              Resend / change number
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
