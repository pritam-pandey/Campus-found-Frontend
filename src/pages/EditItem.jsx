import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { itemsAPI } from '../api/endpoints';
import { CATEGORIES, LOCATIONS, statusMeta } from '../utils/helpers.jsx';

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    itemsAPI
      .get(id)
      .then((d) => {
        const it = d.item;
        setForm({
          itemName: it.itemName || '',
          category: it.category || '',
          description: it.description || '',
          color: it.color || '',
          brand: it.brand || '',
          location: it.location || '',
          date: it.date ? new Date(it.date).toISOString().slice(0, 10) : '',
          time: it.time || '',
          status: it.status || 'active',
          type: it.type,
        });
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="card mx-auto mt-10 max-w-lg p-8 text-center text-red-600">{error}</div>;
  if (!form) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      newImages.forEach((img) => fd.append('images', img));
      await itemsAPI.update(id, fd);
      navigate(`/items/${id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-6">
      <h1 className="text-2xl font-bold text-slate-900">Edit item</h1>
      <p className="mt-1 text-sm text-slate-500">Type: {form.type} · updates go straight to MongoDB.</p>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-5 p-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div>
          <label className="label" htmlFor="itemName">Item name</label>
          <input id="itemName" name="itemName" className="input" value={form.itemName} onChange={handleChange} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="category">Category</label>
            <select id="category" name="category" className="input" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="location">Location</label>
            <select id="location" name="location" className="input" value={form.location} onChange={handleChange}>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={4} className="input" value={form.description} onChange={handleChange} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="color">Color</label>
            <input id="color" name="color" className="input" value={form.color} onChange={handleChange} />
          </div>
          <div>
            <label className="label" htmlFor="brand">Brand</label>
            <input id="brand" name="brand" className="input" value={form.brand} onChange={handleChange} />
          </div>
          <div>
            <label className="label" htmlFor="date">Date</label>
            <input id="date" name="date" type="date" className="input" value={form.date} onChange={handleChange} />
          </div>
          <div>
            <label className="label" htmlFor="time">Time</label>
            <input id="time" name="time" type="time" className="input" value={form.time} onChange={handleChange} />
          </div>
          <div>
            <label className="label" htmlFor="status">Status</label>
            <select id="status" name="status" className="input" value={form.status} onChange={handleChange}>
              {Object.entries(statusMeta).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Add photos</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={(e) => setNewImages(Array.from(e.target.files || []).slice(0, 4))}
            className="input !py-2"
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
