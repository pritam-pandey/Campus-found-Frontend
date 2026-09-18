import { useState } from 'react';
import { DEPARTMENTS, SEMESTERS } from '../utils/helpers.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authAPI } from '../api/endpoints';
import { mediaUrl } from '../api/client';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    department: user?.department || '',
    semester: user?.semester || '',
  });
  const [avatar, setAvatar] = useState(null);
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const fd = new FormData();
      fd.append('fullName', form.fullName);
      fd.append('department', form.department);
      fd.append('semester', form.semester);
      if (avatar) fd.append('profileImage', avatar);
      const d = await authAPI.updateProfile(fd);
      setUser(d.user);
      setNotice('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSavingPwd(true);
    setError('');
    setNotice('');
    try {
      await authAPI.changePassword(pwd);
      setPwd({ currentPassword: '', newPassword: '' });
      setNotice('Password changed successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6">
      <h1 className="text-2xl font-bold text-slate-900">My profile</h1>

      {notice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* -------- Read-only account identity -------- */}
      <section className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          {user?.profileImage ? (
            <img src={mediaUrl(user.profileImage)} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
              {user?.fullName?.[0]?.toUpperCase()}
            </span>
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.fullName}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
          <span className="badge ml-auto bg-primary-50 text-primary-700">{user?.role}</span>
        </div>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
          {[
            ['Mobile', user?.mobile],
            ['Student ID', user?.studentId],
            ['Member since', user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
              <dd className="mt-0.5 font-semibold text-slate-800">{value || '—'}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-slate-400">
          Mobile, email and student ID are permanent identifiers and cannot be changed.
        </p>
      </section>

      {/* -------- Editable fields -------- */}
      <form onSubmit={saveProfile} className="card space-y-4 p-6">
        <h2 className="font-bold text-slate-900">Edit profile</h2>
        <div>
          <label className="label" htmlFor="fullName">Full name</label>
          <input id="fullName" name="fullName" className="input" value={form.fullName} onChange={handleChange} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="department">Department</label>
            <select id="department" name="department" className="input" value={form.department} onChange={handleChange}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="semester">Semester</label>
            <select id="semester" name="semester" className="input" value={form.semester} onChange={handleChange}>
              {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="avatar">Profile picture</label>
          <input
            id="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            className="input !py-2"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      {/* -------- Password -------- */}
      <form onSubmit={savePassword} className="card space-y-4 p-6">
        <h2 className="font-bold text-slate-900">Change password</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="currentPassword">Current password</label>
            <input
              id="currentPassword"
              type="password"
              className="input"
              value={pwd.currentPassword}
              onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              className="input"
              value={pwd.newPassword}
              onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
              minLength={6}
              required
            />
          </div>
        </div>
        <button type="submit" disabled={savingPwd} className="btn-secondary">
          {savingPwd ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
