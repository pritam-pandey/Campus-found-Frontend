import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, PackagePlus, Search } from 'lucide-react';
import { itemsAPI, notificationsAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext.jsx';
import ItemCard from '../components/ItemCard.jsx';
import { statusMeta, typeMeta } from '../utils/helpers.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    itemsAPI.myPosts().then((d) => setMyItems(d.items || [])).catch(() => {});
    notificationsAPI.list({ limit: 5 }).then((d) => {
      setUnread(d.unreadCount || 0);
    }).catch(() => {});
  }, []);

  const lost = myItems.filter((i) => i.type === 'lost');
  const found = myItems.filter((i) => i.type === 'found');
  const active = myItems.filter((i) => i.status === 'active' || i.status === 'possible_match');
  const returned = myItems.filter((i) => i.status === 'returned');

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">Here's what's happening with your items.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/post" className="btn-primary"><PackagePlus size={16} /> Post item</Link>
          <Link to="/browse" className="btn-secondary"><Search size={16} /> Browse</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Lost reported', value: lost.length, cls: 'bg-red-50 text-red-700' },
          { label: 'Found posted', value: found.length, cls: 'bg-sky-50 text-sky-700' },
          { label: 'Active', value: active.length, cls: 'bg-emerald-50 text-emerald-700' },
          { label: 'Returned', value: returned.length, cls: 'bg-slate-100 text-slate-700' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="card p-5">
            <div className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${cls}`}>
              {label}
            </div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      {unread > 0 && (
        <Link
          to="/notifications"
          className="card flex items-center gap-3 border-primary-200 bg-primary-50 p-4 text-primary-800 transition hover:bg-primary-100"
        >
          <Bell size={18} />
          <span className="text-sm font-medium">
            You have {unread} unread notification{unread > 1 ? 's' : ''}
          </span>
        </Link>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Your recent items</h2>
          <Link to="/my-posts" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            View all →
          </Link>
        </div>
        {myItems.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-slate-500">You haven't posted anything yet.</p>
            <Link to="/post" className="btn-primary mt-4">Post your first item</Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myItems.slice(0, 6).map((item) => (
              <div key={item._id} className="relative">
                <span
                  className={`badge absolute bottom-3 right-3 z-10 ${
                    (statusMeta[item.status] || {}).badgeClass || 'bg-slate-100'
                  }`}
                >
                  {(statusMeta[item.status] || {}).label || item.status}
                </span>
                <ItemCard item={item} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Legend</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(typeMeta).map(([k, v]) => (
            <span key={k} className={`badge ${v.badgeClass}`}>{v.label} item</span>
          ))}
          {Object.entries(statusMeta).map(([k, v]) => (
            <span key={k} className={`badge ${v.badgeClass}`}>{v.label}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
