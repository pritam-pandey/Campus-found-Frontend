import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BellRing, MessagesSquare, SearchCheck } from 'lucide-react';
import { itemsAPI } from '../api/endpoints';
import ItemCard from '../components/ItemCard.jsx';

export default function Home() {
  const [recent, setRecent] = useState([]);
  const [counts, setCounts] = useState({ lost: 0, found: 0 });

  useEffect(() => {
    itemsAPI
      .search({ limit: 3 })
      .then((d) => {
        setRecent(d.items || []);
      })
      .catch(() => {});
    itemsAPI.list('lost', { limit: 1 }).then((d) => setCounts((c) => ({ ...c, lost: d.total || 0 }))).catch(() => {});
    itemsAPI.list('found', { limit: 1 }).then((d) => setCounts((c) => ({ ...c, found: d.total || 0 }))).catch(() => {});
  }, []);

  return (
    <div className="space-y-12 py-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 px-6 py-14 text-center text-white sm:px-12">
        <h1 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
          Lost something on campus? Someone may have found it.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-primary-100">
          Campus Found connects students who lost items with those who found them — with instant
          match alerts and private chat.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/browse" className="btn-secondary !border-transparent !bg-white !text-primary-700">
            Browse items <ArrowRight size={16} />
          </Link>
          <Link
            to="/register"
            className="btn-primary !bg-primary-800/60 !text-white ring-1 ring-white/40 hover:!bg-primary-800"
          >
            Get started
          </Link>
        </div>
        <div className="mx-auto mt-10 flex max-w-md items-center justify-center gap-8 text-center text-sm">
          <div>
            <div className="text-2xl font-bold">{counts.lost}</div>
            <div className="text-primary-200">lost reported</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{counts.found}</div>
            <div className="text-primary-200">found posted</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: SearchCheck, title: 'Smart matching', text: 'Post a lost item and we automatically look for matching found items.' },
          { icon: BellRing, title: 'Instant alerts', text: 'Get notified the moment a possible match for your item appears.' },
          { icon: MessagesSquare, title: 'Private chat', text: 'Coordinate the handoff securely inside Campus Found.' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Icon size={20} />
            </span>
            <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{text}</p>
          </div>
        ))}
      </section>

      {recent.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Latest items</h2>
            <Link to="/browse" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
              View all →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">Live data from MongoDB</p>
        </section>
      )}
    </div>
  );
}
