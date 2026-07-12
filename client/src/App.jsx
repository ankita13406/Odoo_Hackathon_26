import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';

function Layout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

// Placeholder pages — replace with real components as each screen gets built
function Dashboard() { return <h2 className="text-xl font-semibold">Dashboard</h2>; }
function OrganizationSetup() { return <h2 className="text-xl font-semibold">Organization Setup</h2>; }
function Assets() { return <h2 className="text-xl font-semibold">Assets</h2>; }
function Allocation() { return <h2 className="text-xl font-semibold">Allocation & Transfer</h2>; }
function Booking() { return <h2 className="text-xl font-semibold">Resource Booking</h2>; }
function Maintenance() { return <h2 className="text-xl font-semibold">Maintenance</h2>; }
function Audit() { return <h2 className="text-xl font-semibold">Audit</h2>; }
function Reports() { return <h2 className="text-xl font-semibold">Reports</h2>; }
function Notifications() { return <h2 className="text-xl font-semibold">Notifications</h2>; }

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/organization-setup" element={<OrganizationSetup />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/allocation" element={<Allocation />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}