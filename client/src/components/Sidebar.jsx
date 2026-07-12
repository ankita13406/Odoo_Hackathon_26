import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/organization-setup', label: 'Organization setup' },
  { to: '/assets', label: 'Assets' },
  { to: '/allocation', label: 'Allocation & Transfer' },
  { to: '/booking', label: 'Resource Booking' },
  { to: '/maintenance', label: 'Maintenance' },
  { to: '/audit', label: 'Audit' },
  { to: '/reports', label: 'Reports' },
  { to: '/notifications', label: 'Notifications' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 h-screen border-r p-4 flex flex-col gap-1">
      <h1 className="font-bold text-lg mb-4">AssetFlow</h1>
      {links.map(l => (
        <NavLink key={l.to} to={l.to}
          className={({ isActive }) => `px-3 py-2 rounded ${isActive ? 'bg-teal-100 font-medium' : 'hover:bg-gray-100'}`}>
          {l.label}
        </NavLink>
      ))}
    </aside>
  );
}