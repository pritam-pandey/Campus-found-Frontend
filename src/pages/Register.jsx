import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { DEPARTMENTS, SEMESTERS } from '../utils/helpers.jsx';

const initialForm = {
  fullName: '',
  email: '',
  mobile: '',
  studentId: '',
  department: '',
  semester: '',
  password: '',
  confirmPassword: '',
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'A valid email is required';
    if (!/^\+?[0-9]{7,15}$/.test(form.mobile)) errs.mobile = 'A valid mobile number is required';
    if (!form.studentId.trim()) errs.studentId = 'Student ID is required';
    if (!form.department) errs.department = 'Department is required';
    if (!form.semester) errs.semester = 'Semester is required';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, props = {}) => (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        className={`input ${errors[name] ? '!border-red-400' : ''}`}
        value={form[name]}
        onChange={handleChange}
        {...props}
      />
      {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl py-10">
      <div className="card p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Join Campus Found to report and recover lost items on campus
          </p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            {field('fullName', 'Full name', { placeholder: 'Rahul Ahmed', required: true })}
          </div>
          {field('email', 'Email', { type: 'email', placeholder: 'you@campus.edu', required: true })}
          {field('mobile', 'Mobile number', { type: 'tel', placeholder: '+8801700000002', required: true })}
          {field('studentId', 'Student ID', { placeholder: 'CSE2101', required: true })}
          <div>
            <label className="label" htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              className={`input ${errors.department ? '!border-red-400' : ''}`}
              value={form.department}
              onChange={handleChange}
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department}</p>}
          </div>
          <div>
            <label className="label" htmlFor="semester">Semester</label>
            <select
              id="semester"
              name="semester"
              className={`input ${errors.semester ? '!border-red-400' : ''}`}
              value={form.semester}
              onChange={handleChange}
            >
              <option value="">Select semester</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.semester && <p className="mt-1 text-xs text-red-600">{errors.semester}</p>}
          </div>
          {field('password', 'Password', { type: 'password', placeholder: 'At least 6 characters', required: true })}
          {field('confirmPassword', 'Confirm password', { type: 'password', placeholder: 'Repeat password', required: true })}

          <div className="sm:col-span-2">
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
