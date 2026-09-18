import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, LogOut, MessageCircle, PackageSearch, PlusCircle, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { notificationsAPI, chatAPI } from '../api/endpoints';
import { mediaUrl } from '../api/client';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [unreadChats, setUnreadChats] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setUnread(0);
      setUnreadChats(0);
      return undefined;
    }

    const refresh = async () => {
      try {
        const [n, c] = await Promise.all([notificationsAPI.unreadCount(), chatAPI.unreadCount()]);
        setUnread(n.count);
        setUnreadChats(c.count);
      } catch {
        /* ignore */
      }
    };
    refresh();
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, [user, user?.role]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
            <PackageSearch size={20} />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Campus<span className="text-primary-600">Found</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/browse" className={linkClass}>Browse</NavLink>
          {user && <NavLink to="/my-posts" className={linkClass}>My Posts</NavLink>}
          {user && (
            <NavLink to="/chat" className={linkClass}>
              <span className="flex items-center gap-1.5">
                <MessageCircle size={16} /> Chat
                {unreadChats > 0 && (
                  <span className="ml-1 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {unreadChats}
                  </span>
                )}
              </span>
            </NavLink>
          )}
          {user?.role === 'admin' && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/post"
                className="btn-primary hidden !py-2 sm:inline-flex"
                title="Post a lost or found item"
              >
                <PlusCircle size={16} /> Post Item
              </Link>
              <Link
                to="/notifications"
                className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
                title="Notifications"
              >
                <Bell size={20} />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-slate-100"
                >
                  {user.profileImage ? (
                    <img src={mediaUrl(user.profileImage)} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <UserCircle size={28} className="text-slate-400" />
                  )}
                  <span className="hidden max-w-[120px] truncate text-sm font-medium sm:block">
                    {user.fullName}
                  </span>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                      <Link
                        to="/profile"
                        className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/my-posts"
                        className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        My Posts
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={15} /> Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !py-2">Log in</Link>
              <Link to="/register" className="btn-primary !py-2">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
