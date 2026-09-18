import { useCallback, useEffect, useState } from 'react';
import { adminAPI } from '../api/endpoints';
import { formatDate, statusMeta, typeMeta } from '../utils/helpers.jsx';

const tabList = ['statistics', 'users', 'items', 'reports'];

export default function Admin() {
  const [tab, setTab] = useState('statistics');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [reports, setReports] = useState([]);
  const [q, setQ] = useState('');
  const [notice, setNotice] = useState('');

  const loadStats = useCallback(() => {
    adminAPI.statistics().then((d) => setStats(d.statistics)).catch(() => {});
  }, []);

  const loadUsers = useCallback((query = '') => {
    adminAPI.users(query ? { q: query } : {}).then((d) => setUsers(d.users || [])).catch(() => {});
  }, []);

  const loadItems = useCallback(() => {
    adminAPI.items({ limit: 50 }).then((d) => setItems(d.items || [])).catch(() => {});
  }, []);

  const loadReports = useCallback(() => {
    adminAPI.reports({ limit: 50 }).then((d) => setReports(d.reports || [])).catch(() => {});
  }, []);

  useEffect(() => {
    loadStats();
    loadUsers();
    loadItems();
    loadReports();
  }, [loadStats, loadUsers, loadItems, loadReports]);

  const suspend = async (u) => {
    try {
      await adminAPI.suspendUser(u._id, !u.suspended);
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, suspended: !u.suspended } : x)));
      setNotice(u.suspended ? `${u.fullName} reinstated` : `${u.fullName} suspended`);
    } catch (err) {
      setNotice(err.message);
    }
  };

  const removeItem = async (item) => {
    if (!window.confirm(`Delete "${item.itemName}"?`)) return;
    try {
      await adminAPI.deleteItem(item._id);
      setItems((prev) => prev.filter((x) => x._id !== item._id));
      loadStats();
      setNotice(`Deleted "${item.itemName}"`);
    } catch (err) {
      setNotice(err.message);
    }
  };

  const setReportStatus = async (r, status) => {
    try {
      await adminAPI.updateReport(r._id, status);
      setReports((prev) => prev.map((x) => (x._id === r._id ? { ...x, status } : x)));
      setNotice(`Report marked ${status}`);
    } catch (err) {
      setNotice(err.message);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin panel</h1>
        <p className="mt-1 text-sm text-slate-500">Live data from MongoDB — users, items, reports and statistics.</p>
      </div>

      {notice && (
        <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">{notice}</div>
      )}

      <div className="flex flex-wrap gap-2">
        {tabList.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
              tab === t ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* -------- Statistics -------- */}
      {tab === 'statistics' && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Registered students', stats.totalStudents, 'bg-primary-50 text-primary-700'],
            ['Total lost items', stats.totalLostItems, 'bg-red-50 text-red-700'],
            ['Total found items', stats.totalFoundItems, 'bg-sky-50 text-sky-700'],
            ['Total returned', stats.totalReturnedItems, 'bg-emerald-50 text-emerald-700'],
            ['Active items', stats.activeLostItems + stats.activeFoundItems, 'bg-amber-50 text-amber-700'],
            ['Possible matches', stats.possibleMatches, 'bg-violet-50 text-violet-700'],
            ['Conversations', stats.totalConversations, 'bg-slate-100 text-slate-700'],
            ['Messages', stats.totalMessages, 'bg-slate-100 text-slate-700'],
            ['Pending reports', stats.pendingReports, 'bg-red-50 text-red-700'],
          ].map(([label, value, cls]) => (
            <div key={label} className="card p-5">
              <div className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${cls}`}>{label}</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{value ?? 0}</div>
            </div>
          ))}
        </div>
      )}

      {/* -------- Users -------- */}
      {tab === 'users' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              className="input max-w-xs"
              placeholder="Search by name, email, student ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadUsers(q)}
            />
            <button onClick={() => loadUsers(q)} className="btn-secondary !py-2">Search</button>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Dept / Semester</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{u.fullName} {u.suspended && <span className="badge ml-1 bg-red-100 text-red-600">Suspended</span>}</p>
                      <p className="text-xs text-slate-400">{u.email} · {u.mobile} · {u.studentId}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.department} · {u.semester}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => suspend(u)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            u.suspended ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {u.suspended ? 'Reinstate' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------- Items -------- */}
      {tab === 'items' && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Posted</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b border-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{item.itemName}</td>
                  <td className="px-4 py-3 text-slate-600">{item.userId?.fullName || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${(typeMeta[item.type] || {}).badgeClass}`}>{item.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${(statusMeta[item.status] || {}).badgeClass}`}>{(statusMeta[item.status] || {}).label || item.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => removeItem(item)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -------- Reports -------- */}
      {tab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="card p-10 text-center text-slate-500">No reports — the campus is peaceful 🎉</div>
          ) : (
            reports.map((r) => (
              <div key={r._id} className="card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`badge ${
                    r.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    r.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                    r.status === 'rejected' ? 'bg-slate-100 text-slate-600' : 'bg-sky-100 text-sky-700'
                  }`}>{r.status}</span>
                  <span className="font-semibold text-slate-900">{r.reason}</span>
                  <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{r.description || 'No extra description.'}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Reported by {r.reporterId?.fullName || 'unknown'}
                  {r.reportedUserId ? ` · against user ${r.reportedUserId.fullName || r.reportedUserId}` : ''}
                  {r.reportedItemId ? ` · item "${r.reportedItemId.itemName || r.reportedItemId}"` : ''}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['reviewed', 'resolved', 'rejected'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setReportStatus(r, s)}
                      disabled={r.status === s}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold capitalize text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                    >
                      Mark {s}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
