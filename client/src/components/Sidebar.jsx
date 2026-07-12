import { NavLink } from "react-router-dom";

const links = [
  {
    to: "/dashboard",
    label: "Dashboard",
  },
  {
    to: "/organization-setup",
    label: "Organization Setup",
  },
  {
    to: "/assets",
    label: "Assets",
  },
  {
    to: "/allocation",
    label: "Allocation & Transfer",
  },
  {
    to: "/booking",
    label: "Resource Booking",
  },
  {
    to: "/maintenance",
    label: "Maintenance",
  },
  {
    to: "/audit",
    label: "Audit",
  },
  {
    to: "/reports",
    label: "Reports",
  },
  {
    to: "/notifications",
    label: "Notifications",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen border-r bg-white p-5 flex flex-col">

      <h1 className="text-2xl font-bold mb-8">
        AssetFlow
      </h1>

      <nav className="flex flex-col gap-2">

        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-lg px-4 py-2 transition-all ${
                isActive
                  ? "bg-teal-100 text-teal-700 font-semibold"
                  : "hover:bg-gray-100"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}

      </nav>

    </aside>
  );
}