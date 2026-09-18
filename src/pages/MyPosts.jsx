import { useEffect, useState } from 'react';
import { itemsAPI } from '../api/endpoints';
import ItemCard from '../components/ItemCard.jsx';
import { statusMeta } from '../utils/helpers.jsx';

export default function MyPosts() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemsAPI
      .myPosts()
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((i) => {
    if (filter === 'all') return true;
    if (filter === 'active') return i.status === 'active' || i.status === 'possible_match';
    if (filter === 'lost') return i.type === 'lost';
    if (filter === 'found') return i.type === 'found';
    if (filter === 'returned') return i.status === 'returned';
    return true;
  });

  const tabs = [
    { key: 'all', label: `All (${items.length})` },
    { key: 'lost', label: `Lost (${items.filter((i) => i.type === 'lost').length})` },
    { key: 'found', label: `Found (${items.filter((i) => i.type === 'found').length})` },
    { key: 'active', label: `Active (${items.filter((i) => i.status === 'active' || i.status === 'possible_match').length})` },
    { key: 'returned', label: `Returned (${items.filter((i) => i.status === 'returned').length})` },
  ];

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My posts</h1>
        <p className="mt-1 text-sm text-slate-500">Everything you've reported, loaded from MongoDB.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              filter === t.key ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">Nothing here yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
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
    </div>
  );
}
