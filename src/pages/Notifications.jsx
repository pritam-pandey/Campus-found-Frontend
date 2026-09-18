import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, CheckCheck } from 'lucide-react';
import { notificationsAPI } from '../api/endpoints';
import { timeAgo } from '../utils/helpers.jsx';

const typeStyles = {
  message: { icon: '💬', cls: 'bg-sky-50' },
  possible_match: { icon: '🎯', cls: 'bg-amber-50' },
  item_returned: { icon: '🎉', cls: 'bg-emerald-50' },
  report: { icon: '🚩', cls: 'bg-red-50' },
  system: { icon: '📣', cls: 'bg-slate-100' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    notificationsAPI
      .list({ limit: 50 })
      .then((d) => setNotifications(d.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (n) => {
    if (n.isRead) {
      if (n.relatedItemId?._id || n.relatedItemId) {
        navigateToRelated(n);
      }
      return;
    }
    await notificationsAPI.markRead(n._id);
    setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
    if (n.relatedItemId?._id || n.relatedItemId) navigateToRelated(n);
  };

  const navigateToRelated = (n) => {
    const itemId = n.relatedItemId?._id || n.relatedItemId;
    if (itemId) window.location.href = `/items/${itemId}`;
  };

  const markAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up 🎉'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary !py-2">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-12 text-center text-slate-400">
          <BellRing size={28} />
          <p className="text-sm">No notifications yet. Post an item to get match alerts!</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const style = typeStyles[n.type] || typeStyles.system;
            return (
              <li
                key={n._id}
                className={`card flex cursor-pointer items-start gap-3 p-4 transition hover:shadow-md ${style.cls} ${
                  n.isRead ? 'opacity-70' : 'ring-1 ring-primary-200'
                }`}
                onClick={() => markRead(n)}
              >
                <span className="text-xl">{style.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{n.message}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary-500" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
