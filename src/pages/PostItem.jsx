import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ImagePlus } from 'lucide-react';
import { itemsAPI } from '../api/endpoints';
import { CATEGORIES, LOCATIONS } from '../utils/helpers.jsx';

const initial = {
  type: 'lost',
  itemName: '',
  category: '',
  description: '',
  color: '',
  brand: '',
  location: '',
  date: '',
  time: '',
};

export default function PostItem() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ ...initial, type: params.get('type') === 'found' ? 'found' : 'lost' });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onFiles = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.itemName || !form.category || !form.description || !form.location || !form.date) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append('images', img));
      await itemsAPI.create(form.type, fd);
      navigate('/my-posts');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const preview = (f) => (f ? URL.createObjectURL(f) : null);

  return (
    <div className="mx-auto max-w-2xl py-6">
      <h1 className="text-2xl font-bold text-slate-900">Post an item</h1>
      <p className="mt-1 text-sm text-slate-500">
        Report something you lost or found on campus. Possible matches are detected automatically.
      </p>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-5 p-6">
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'lost', label: '🔍 I lost something', active: 'border-red-400 bg-red-50 text-red-700' },
            { value: 'found', label: '🙋 I found something', active: 'border-sky-400 bg-sky-50 text-sky-700' },
          ].map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
              className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                form.type === opt.value ? opt.active : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div>
          <label className="label" htmlFor="itemName">Item name *</label>
          <input id="itemName" name="itemName" className="input" placeholder="e.g. Black wallet"
            value={form.itemName} onChange={handleChange} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="category">Category *</label>
            <select id="category" name="category" className="input" value={form.category} onChange={handleChange} required>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="location">Location *</label>
            <select id="location" name="location" className="input" value={form.location} onChange={handleChange} required>
              <option value="">Where?</option>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="description">Description *</label>
          <textarea id="description" name="description" rows={4} className="input"
            placeholder="Describe the item, distinctive marks, contents…"
            value={form.description} onChange={handleChange} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="color">Color</label>
            <input id="color" name="color" className="input" placeholder="e.g. Black" value={form.color} onChange={handleChange} />
          </div>
          <div>
            <label className="label" htmlFor="brand">Brand</label>
            <input id="brand" name="brand" className="input" placeholder="e.g. Leader" value={form.brand} onChange={handleChange} />
          </div>
          <div>
            <label className="label" htmlFor="date">Date *</label>
            <input id="date" name="date" type="date" className="input" value={form.date} onChange={handleChange} required />
          </div>
          <div>
            <label className="label" htmlFor="time">Time</label>
            <input id="time" name="time" type="time" className="input" value={form.time} onChange={handleChange} />
          </div>
        </div>

        <div>
          <label className="label">Photos (up to 4)</label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-primary-400 hover:bg-primary-50">
            <ImagePlus size={24} className="text-slate-400" />
            <span className="text-sm text-slate-500">Click to upload images (JPG, PNG, WEBP)</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={onFiles} />
          </label>
          {images.length > 0 && (
            <div className="mt-3 flex gap-2">
              {images.map((f, i) => (
                <img key={i} src={preview(f)} alt="" className="h-16 w-16 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Posting…' : `Post ${form.type} item`}
        </button>
      </form>
    </div>
  );
}
