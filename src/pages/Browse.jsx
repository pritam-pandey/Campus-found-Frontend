import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { itemsAPI } from '../api/endpoints';
import ItemCard from '../components/ItemCard.jsx';
import { CATEGORIES, LOCATIONS } from '../utils/helpers.jsx';

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const q = params.get('q') || '';
  const type = params.get('type') || '';
  const category = params.get('category') || '';
  const location = params.get('location') || '';
  const status = params.get('status') || '';
  const dateFrom = params.get('dateFrom') || '';
  const dateTo = params.get('dateTo') || '';
  const page = parseInt(params.get('page') || '1', 10);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setParams(next);
  };

  useEffect(() => {
    setLoading(true);
    const query = { page, limit: 12 };
    if (q) query.q = q;
    if (type) query.type = type;
    if (category) query.category = category;
    if (location) query.location = location;
    if (status) query.status = status;
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;

    itemsAPI
      .search(query)
      .then((d) => {
        setItems(d.items || []);
        setTotal(d.total || 0);
        setPages(d.pages || 1);
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [q, type, category, location, status, dateFrom, dateTo, page]);

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Browse items</h1>
        <p className="mt-1 text-sm text-slate-500">
          Search all lost &amp; found items — powered by MongoDB queries.
        </p>
      </div>

      <form
        className="card flex flex-wrap items-center gap-3 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          setParam('q', new FormData(e.currentTarget).get('q') || '');
        }}
      >
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search: black wallet, backpack…"
            className="input !pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select value={type} onChange={(e) => setParam('type', e.target.value)} className="input !w-auto">
            <option value="">Lost &amp; Found</option>
            <option value="lost">Lost only</option>
            <option value="found">Found only</option>
          </select>
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className="btn-secondary !py-2.5"
          >
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>
      </form>

      {showFilters && (
        <div className="card grid gap-3 p-4 sm:grid-cols-4">
          <div>
            <label className="label">Category</label>
            <select value={category} onChange={(e) => setParam('category', e.target.value)} className="input">
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <select value={location} onChange={(e) => setParam('location', e.target.value)} className="input">
              <option value="">All locations</option>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select value={status} onChange={(e) => setParam('status', e.target.value)} className="input">
              <option value="">Any status</option>
              <option value="active">Active</option>
              <option value="possible_match">Possible match</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">From</label>
              <input type="date" value={dateFrom} onChange={(e) => setParam('dateFrom', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">To</label>
              <input type="date" value={dateTo} onChange={(e) => setParam('dateTo', e.target.value)} className="input" />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          No items match your search. Try different keywords or filters.
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">{total} item{total !== 1 ? 's' : ''} found</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => <ItemCard key={item._id} item={item} />)}
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                className="btn-secondary !py-2"
                disabled={page <= 1}
                onClick={() => setParam('page', String(page - 1))}
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">Page {page} of {pages}</span>
              <button
                className="btn-secondary !py-2"
                disabled={page >= pages}
                onClick={() => setParam('page', String(page + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
