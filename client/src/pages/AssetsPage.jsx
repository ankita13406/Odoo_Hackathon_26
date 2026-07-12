import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Search,
  Plus,
  X,
  Clock,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Loader2,
} from 'lucide-react';
import { getAssets, createAsset, getAssetHistory } from '../api/asset';
import { getCategories } from '../api/category';
import { getDepartments } from '../api/department';

const ASSET_STATUSES = [
  'Available',
  'Allocated',
  'Reserved',
  'UnderMaintenance',
  'Lost',
  'Retired',
  'Disposed',
];

const CONDITION_OPTIONS = ['New', 'Good', 'Fair', 'Poor', 'Damaged'];

const STATUS_STYLES = {
  Available: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Allocated: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Reserved: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  UnderMaintenance: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  Lost: 'bg-red-50 text-red-700 ring-red-600/20',
  Retired: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  Disposed: 'bg-zinc-200 text-zinc-700 ring-zinc-500/20',
};

const PAGE_SIZE = 10;

function humanizeStatus(status) {
  if (!status) return '—';
  return status.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * The backend's history endpoint isn't pinned to a single shape in the spec,
 * so this normalizer accepts either:
 *   - a flat array of already-shaped history entries, or
 *   - an object with any of { allocations, transferRequests, bookings,
 *     maintenanceRequests, auditItems } sub-arrays (matching the Prisma
 *     models that reference Asset)
 * and merges everything into one timeline sorted newest-first.
 */
function normalizeHistory(raw, departmentMap) {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((entry, idx) => ({
        id: entry.id ?? `entry-${idx}`,
        type: entry.type || 'Event',
        date: entry.date || entry.createdAt || entry.allocatedAt || null,
        title: entry.title || entry.description || 'Event',
        detail: entry.detail || entry.notes || null,
        status: entry.status || null,
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  const entries = [];

  (raw.allocations || []).forEach((a) => {
    const target = a.employeeId
      ? `employee #${a.employeeId}`
      : a.departmentId
      ? departmentMap[a.departmentId] || `department #${a.departmentId}`
      : 'unassigned';
    entries.push({
      id: `allocation-${a.id}`,
      type: 'Allocation',
      date: a.allocatedAt,
      title: `Allocated to ${target}`,
      detail: a.returnedAt
        ? `Returned ${formatDateTime(a.returnedAt)}${a.checkInNotes ? ` — ${a.checkInNotes}` : ''}`
        : a.expectedReturnDate
        ? `Expected return ${formatDate(a.expectedReturnDate)}`
        : null,
      status: a.status,
    });
  });

  (raw.transferRequests || raw.transfers || []).forEach((t) => {
    entries.push({
      id: `transfer-${t.id}`,
      type: 'Transfer',
      date: t.createdAt,
      title: `Transfer requested to employee #${t.toEmployeeId}`,
      detail: t.reason || null,
      status: t.status,
    });
  });

  (raw.bookings || []).forEach((b) => {
    entries.push({
      id: `booking-${b.id}`,
      type: 'Booking',
      date: b.createdAt || b.startTime,
      title: `Booked ${formatDateTime(b.startTime)} → ${formatDateTime(b.endTime)}`,
      detail: null,
      status: b.status,
    });
  });

  (raw.maintenanceRequests || raw.maintenance || []).forEach((m) => {
    entries.push({
      id: `maintenance-${m.id}`,
      type: 'Maintenance',
      date: m.createdAt,
      title: m.issueDescription,
      detail: m.technicianName
        ? `Technician: ${m.technicianName}${m.resolvedAt ? ` — resolved ${formatDateTime(m.resolvedAt)}` : ''}`
        : null,
      status: m.status,
    });
  });

  (raw.auditItems || raw.audits || []).forEach((au) => {
    entries.push({
      id: `audit-${au.id}`,
      type: 'Audit',
      date: au.auditCycle?.startDate || null,
      title: au.result ? `Audit result: ${au.result}` : 'Audited',
      detail: au.notes || null,
      status: au.result,
    });
  });

  return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 ring-slate-500/20';
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {humanizeStatus(status)}
    </span>
  );
}

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerError, setRegisterError] = useState(null);

  const [historyAsset, setHistoryAsset] = useState(null);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      
      name: '',
      categoryId: '',
      serialNumber: '',
      acquisitionDate: '',
      acquisitionCost: '',
      condition: '',
      location: '',
      isBookable: false,
      photoUrl: '',
    },
  });

  const departmentMap = useMemo(() => {
    const map = {};
    departments.forEach((d) => {
      map[d.id] = d.name;
    });
    return map;
  }, [departments]);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(assets.map((a) => a.location).filter(Boolean))).sort();
  }, [assets]);

  async function fetchInitialData() {
    setLoading(true);
    setError(null);
    try {
      const [assetsRes, categoriesRes, departmentsRes] = await Promise.all([
        getAssets(),
        getCategories(),
        getDepartments(),
      ]);
      setAssets(assetsRes.data.data);

setCategories(categoriesRes.data.data);

setDepartments(departmentsRes.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, statusFilter, locationFilter]);

  const filteredAssets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return assets.filter((asset) => {
      const matchesSearch =
        !term ||
        asset.name?.toLowerCase().includes(term) ||
        asset.assetTag?.toLowerCase().includes(term) ||
        asset.serialNumber?.toLowerCase().includes(term);
      const matchesCategory =
        categoryFilter === 'all' || String(asset.categoryId) === String(categoryFilter);
      const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
      const matchesLocation = locationFilter === 'all' || asset.location === locationFilter;
      return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
    });
  }, [assets, search, categoryFilter, statusFilter, locationFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / PAGE_SIZE));
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const hasActiveFilters =
    search !== '' || categoryFilter !== 'all' || statusFilter !== 'all' || locationFilter !== 'all';

  function clearFilters() {
    setSearch('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setLocationFilter('all');
  }

  async function onSubmit(data) {
    setRegisterError(null);
    const payload = {
      
      name: data.name.trim(),
      categoryId: Number(data.categoryId),
      serialNumber: data.serialNumber?.trim() || null,
      acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate).toISOString() : null,
      acquisitionCost:
        data.acquisitionCost === '' || data.acquisitionCost === undefined
          ? null
          : Number(data.acquisitionCost),
      condition: data.condition || null,
      location: data.location?.trim() || null,
      isBookable: Boolean(data.isBookable),
      photoUrl: data.photoUrl?.trim() || null,
    };

    try {
      const response = await createAsset(payload);

setAssets((prev) => [
    response.data.data,
    ...prev,
]);
      reset();
      setIsRegisterOpen(false);
    } catch (err) {
    setRegisterError(
        err.response?.data?.error ||
        err.message ||
        "Failed to create asset."
    );
}
  }

  function closeRegisterModal() {
    setIsRegisterOpen(false);
    setRegisterError(null);
    reset();
  }

  async function openHistory(asset) {
    setHistoryAsset(asset);
    setHistoryEntries([]);
    setHistoryError(null);
    setHistoryLoading(true);
    try {
        const response = await getAssetHistory(asset.id);

setHistoryEntries(
    normalizeHistory(
        response.data.data,
        departmentMap
    )
);
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  }

  function closeHistory() {
    setHistoryAsset(null);
    setHistoryEntries([]);
    setHistoryError(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Assets</h1>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? 'Loading inventory…' : `${filteredAssets.length} of ${assets.length} assets`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Register Asset
          </button>
        </div>

        {/* Global error banner */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Couldn't load assets</p>
              <p className="mt-0.5 text-sm text-red-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchInitialData}
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-300 hover:bg-red-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, tag, or serial…"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">All statuses</option>
            {ASSET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {humanizeStatus(s)}
              </option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">All locations</option>
            {uniqueLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-teal-700 hover:text-teal-800"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Asset Tag
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Acquired
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cost
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`skeleton-${i}`}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 w-full  animate-pulse rounded bg-slate-200" />
                        </td>
                      ))}
                    </tr>
                  ))}

                {!loading && paginatedAssets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <PackageSearch className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-2 text-sm font-medium text-slate-600">No assets found</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {hasActiveFilters
                          ? 'Try adjusting your search or filters.'
                          : 'Register your first asset to get started.'}
                      </p>
                    </td>
                  </tr>
                )}

                {!loading &&
                  paginatedAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900">
                        {asset.assetTag}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <span>{asset.name}</span>
                          {asset.isBookable && (
                            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700 ring-1 ring-inset ring-teal-600/20">
                              Bookable
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                        {categoryMap[asset.categoryId] || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <StatusBadge status={asset.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                        {asset.location || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                        {formatDate(asset.acquisitionDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                        {formatCurrency(asset.acquisitionCost)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                        <button
                          type="button"
                          onClick={() => openHistory(asset)}
                          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-100"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          History
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredAssets.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Register Asset</h2>
              <button
                type="button"
                onClick={closeRegisterModal}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
              {registerError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-sm text-red-700">{registerError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
               

                <div>
                  <label className="block text-sm font-medium text-slate-700">Name</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    placeholder="Dell Latitude 5420"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Category</label>
                  <select
                    {...register('categoryId', {
                      required: 'Category is required',
                      valueAsNumber: true,
                    })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Serial Number</label>
                  <input
                    type="text"
                    {...register('serialNumber')}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Acquisition Date
                  </label>
                  <input
                    type="date"
                    {...register('acquisitionDate')}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Acquisition Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('acquisitionCost', {
                      min: { value: 0, message: 'Must be 0 or more' },
                    })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    placeholder="0.00"
                  />
                  {errors.acquisitionCost && (
                    <p className="mt-1 text-xs text-red-600">{errors.acquisitionCost.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Condition</label>
                  <select
                    {...register('condition')}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    defaultValue=""
                  >
                    <option value="">Not specified</option>
                    {CONDITION_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Location</label>
                  <input
                    type="text"
                    {...register('location')}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    placeholder="e.g. Patna Office - Floor 2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Photo URL</label>
                <input
                  type="text"
                  {...register('photoUrl')}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  placeholder="Optional"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('isBookable')}
                  className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                />
                <span className="text-sm text-slate-700">This asset can be booked</span>
              </label>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={closeRegisterModal}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Saving…' : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{historyAsset.name}</h2>
                <p className="text-sm text-slate-500">{historyAsset.assetTag} · History</p>
              </div>
              <button
                type="button"
                onClick={closeHistory}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {historyLoading && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              )}

              {historyError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-sm text-red-700">{historyError}</p>
                </div>
              )}

              {!historyLoading && !historyError && historyEntries.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">
                  No history recorded for this asset yet.
                </p>
              )}

              {!historyLoading && !historyError && historyEntries.length > 0 && (
                <ol className="space-y-4">
                  {historyEntries.map((entry) => (
                    <li key={entry.id} className="relative border-l-2 border-slate-200 pl-4">
                      <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-teal-600" />
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                          {entry.type}
                        </span>
                        <span className="text-xs text-slate-400">{formatDateTime(entry.date)}</span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-800">{entry.title}</p>
                      {entry.detail && (
                        <p className="mt-0.5 text-sm text-slate-500">{entry.detail}</p>
                      )}
                      {entry.status && (
                        <span className="mt-1 inline-block text-xs text-slate-400">
                          Status: {humanizeStatus(entry.status)}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}