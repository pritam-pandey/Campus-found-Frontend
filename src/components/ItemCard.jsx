import { Link } from 'react-router-dom';
import { MapPin, CalendarDays } from 'lucide-react';
import { mediaUrl } from '../api/client';
import { formatDate, statusMeta, typeMeta } from '../utils/helpers.jsx';

export default function ItemCard({ item }) {
  const cover = mediaUrl(item.images?.[0]);
  const tm = typeMeta[item.type] || {};
  const sm = statusMeta[item.status] || {};

  return (
    <Link
      to={`/items/${item._id}`}
      className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        {cover ? (
          <img
            src={cover}
            alt={item.itemName}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-slate-300">📦</div>
        )}
        <span className={`badge absolute left-3 top-3 ${tm.badgeClass}`}>{tm.label} item</span>
        {item.status === 'possible_match' && (
          <span className="badge absolute right-3 top-3 bg-amber-100 text-amber-700">Possible match</span>
        )}
        {item.status === 'returned' && (
          <span className="badge absolute right-3 top-3 bg-emerald-100 text-emerald-700">Returned</span>
        )}
      </div>
      <div className="space-y-1.5 p-4">
        <h3 className="line-clamp-1 font-semibold text-slate-900 group-hover:text-primary-700">
          {item.itemName}
        </h3>
        <p className="line-clamp-2 text-sm text-slate-500">{item.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-slate-400">
          <span className="flex items-center gap-1"><MapPin size={13} /> {item.location}</span>
          <span className="flex items-center gap-1"><CalendarDays size={13} /> {formatDate(item.date)}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
            {item.category}
          </span>
        </div>
      </div>
    </Link>
  );
}
