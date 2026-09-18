import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, Flag, MapPin, MessageCircle, PackageCheck, Pencil, Trash2 } from 'lucide-react';
import { chatAPI, itemsAPI, reportsAPI } from '../api/endpoints';
import { mediaUrl } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, statusMeta, typeMeta } from '../utils/helpers.jsx';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [notice, setNotice] = useState('');

  const isOwner = user && item && String(item.userId?._id || item.userId) === String(user._id);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    setItem(null);
    setError('');
    itemsAPI
      .get(id)
      .then((d) => setItem(d.item))
      .catch((err) => setError(err.message));
  }, [id]);

  const startChat = async () => {
    setStartingChat(true);
    try {
      const d = await chatAPI.startConversation(id);
      navigate(`/chat/${d.conversation._id}`);
    } catch (err) {
      setNotice(err.message);
    } finally {
      setStartingChat(false);
    }
  };

  const markReturned = async () => {
    setActionBusy(true);
    try {
      const d = await itemsAPI.markReturned(id);
      setItem((prev) => ({ ...prev, status: d.item.status }));
      setNotice('Item marked as returned 🎉');
    } catch (err) {
      setNotice(err.message);
    } finally {
      setActionBusy(false);
    }
  };

  const removeItem = async () => {
    if (!window.confirm('Delete this item permanently?')) return;
    setActionBusy(true);
    try {
      await itemsAPI.remove(id);
      navigate('/my-posts');
    } catch (err) {
      setNotice(err.message);
      setActionBusy(false);
    }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    try {
      await reportsAPI.create({
        reportedItemId: id,
        reportedUserId: item.userId?._id || item.userId,
        reason: reportReason,
      });
      setShowReport(false);
      setReportReason('');
      setNotice('Report submitted. Our admins will review it.');
    } catch (err) {
      setNotice(err.message);
    }
  };

  if (error) {
    return (
      <div className="card mx-auto mt-10 max-w-lg p-10 text-center">
        <p className="text-slate-500">{error}</p>
        <Link to="/browse" className="btn-primary mt-4">Back to browse</Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  const tm = typeMeta[item.type] || {};
  const sm = statusMeta[item.status] || {};
  const owner = item.userId || {};

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-4">
      {notice && (
        <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">
          {notice}
        </div>
      )}

      <button onClick={() => navigate(-1)} className="text-sm font-medium text-slate-500 hover:text-slate-800">
        ← Back
      </button>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="card flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-100">
            {item.images?.[0] ? (
              <img src={mediaUrl(item.images[0])} alt={item.itemName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-6xl text-slate-300">📦</span>
            )}
          </div>
          {item.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {item.images.slice(1, 5).map((img, i) => (
                <div key={i} className="card aspect-square overflow-hidden bg-slate-100">
                  <img src={mediaUrl(img)} alt={`${item.itemName} ${i + 2}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${tm.badgeClass}`}>{tm.label} item</span>
            <span className={`badge ${sm.badgeClass}`}>{sm.label || item.status}</span>
            <span className="badge bg-slate-100 text-slate-600">{item.category}</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">{item.itemName}</h1>
          <p className="whitespace-pre-line text-slate-600">{item.description}</p>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Location', item.location, MapPin],
              ['Date', formatDate(item.date), CalendarDays],
              ['Time', item.time || '—', null],
              ['Color', item.color || '—', null],
              ['Brand', item.brand || '—', null],
            ].map(([label, value, Icon]) => (
              <div key={label} className="card p-3">
                <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                  {Icon && <Icon size={12} />} {label}
                </dt>
                <dd className="mt-0.5 font-semibold text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="card flex items-center gap-3 p-4">
            {owner.profileImage ? (
              <img src={mediaUrl(owner.profileImage)} alt="" className="h-11 w-11 rounded-full object-cover" />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700">
                {owner.fullName?.[0]?.toUpperCase() || '?'}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">{owner.fullName || 'Unknown user'}</p>
              <p className="text-xs text-slate-500">
                {[owner.department, owner.studentId].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {user && !isOwner && item.status !== 'returned' && (
              <button onClick={startChat} disabled={startingChat} className="btn-primary flex-1">
                <MessageCircle size={16} /> {startingChat ? 'Opening chat…' : 'Message owner'}
              </button>
            )}
            {(isOwner || isAdmin) && (
              <>
                <Link to={`/items/${id}/edit`} className="btn-secondary flex-1">
                  <Pencil size={15} /> Edit
                </Link>
                {item.status !== 'returned' && (
                  <button onClick={markReturned} disabled={actionBusy} className="btn-primary flex-1 !bg-emerald-600 hover:!bg-emerald-700">
                    <PackageCheck size={16} /> Mark returned
                  </button>
                )}
                <button onClick={removeItem} disabled={actionBusy} className="btn-danger">
                  <Trash2 size={15} />
                </button>
              </>
            )}
            {user && !isOwner && (
              <button onClick={() => setShowReport((s) => !s)} className="btn-secondary">
                <Flag size={15} /> Report
              </button>
            )}
            {!user && (
              <Link to="/login" className="btn-primary flex-1">Log in to contact the owner</Link>
            )}
          </div>

          {showReport && (
            <form onSubmit={submitReport} className="card space-y-3 p-4">
              <div>
                <label className="label" htmlFor="reason">Why are you reporting this?</label>
                <input
                  id="reason"
                  className="input"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="e.g. Fake listing, offensive content…"
                  required
                />
              </div>
              <button className="btn-danger w-full !py-2">Submit report</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
