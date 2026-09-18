export const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const timeAgo = (d) => {
  if (!d) return '';
  const seconds = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
};

export const typeMeta = {
  lost: { label: 'Lost', badgeClass: 'bg-red-100 text-red-700' },
  found: { label: 'Found', badgeClass: 'bg-sky-100 text-sky-700' },
};

export const statusMeta = {
  active: { label: 'Active', badgeClass: 'bg-emerald-100 text-emerald-700' },
  possible_match: { label: 'Possible match', badgeClass: 'bg-amber-100 text-amber-700' },
  returned: { label: 'Returned', badgeClass: 'bg-slate-200 text-slate-700' },
  closed: { label: 'Closed', badgeClass: 'bg-slate-200 text-slate-600' },
};

export const CATEGORIES = [
  'Electronics',
  'Wallet',
  'Keys',
  'Bags',
  'Documents',
  'Clothing',
  'Books',
  'Water Bottle',
  'Jewelry',
  'Eyewear',
  'Sports Equipment',
  'Other',
];

export const LOCATIONS = [
  'Main Library',
  'Cafeteria',
  'Building A',
  'Building B',
  'Building C',
  'Auditorium',
  'Sports Complex',
  'Dormitory',
  'Parking Lot',
  'Campus Grounds',
  'Other',
];

export const DEPARTMENTS = [
  'CSE',
  'EEE',
  'BBA',
  'Civil',
  'Mechanical',
  'Law',
  'Arts',
  'Pharmacy',
  'Other',
];

export const SEMESTERS = [
  'Spring 2025',
  'Fall 2025',
  'Spring 2026',
  'Fall 2026',
  'Spring 2027',
  'Other',
];
