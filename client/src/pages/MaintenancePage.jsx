import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Wrench,
  PlayCircle,
  CheckCheck,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { getMaintenance, updateMaintenance } from "../api/maintenance";

const COLUMNS = ["Pending", "Approved", "TechnicianAssigned", "InProgress", "Resolved"];

// Rejected isn't shown as its own column — a rejected request simply leaves
// the active board, which is why it's a valid transition but not a column.
const TRANSITIONS = {
  Pending: ["Approved", "Rejected"],
  Approved: ["TechnicianAssigned"],
  TechnicianAssigned: ["InProgress"],
  InProgress: ["Resolved"],
  Resolved: [],
  Rejected: [],
};

const PRIORITY_STYLES = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-amber-100 text-amber-700",
  Critical: "bg-red-100 text-red-700",
};

function humanize(status) {
  if (!status) return "—";
  return status.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function getButtonIcon(status) {
  switch (status) {
    case "Approved":
      return <CheckCircle size={16} />;
    case "Rejected":
      return <XCircle size={16} />;
    case "TechnicianAssigned":
      return <Wrench size={16} />;
    case "InProgress":
      return <PlayCircle size={16} />;
    case "Resolved":
      return <CheckCheck size={16} />;
    default:
      return <AlertTriangle size={16} />;
  }
}

// Defensive against whichever envelope shape the API returns:
// a flat array, { data: [...] }, or a raw axios response with { data: { data: [...] } }.
function extractList(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  return [];
}

// MaintenanceRequest.asset is a relation, not a plain string — handle both
// in case the backend ever returns just the FK without the include.
function assetLabel(request) {
  if (typeof request.asset === "string") return request.asset;
  return (
    request.asset?.name ||
    request.asset?.assetTag ||
    (request.assetId ? `Asset #${request.assetId}` : "Unknown asset")
  );
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [technician, setTechnician] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  async function loadMaintenance() {
    setLoading(true);
    setError(null);
    try {
      const raw = await getMaintenance();
      setRequests(extractList(raw));
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Unable to load maintenance requests."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMaintenance();
  }, []);

  async function moveRequest(request, nextStatus) {
    setUpdatingId(request.id);
    setError(null);
    try {
      await updateMaintenance(request.id, {
        status: nextStatus,
        technicianName: nextStatus === "TechnicianAssigned" ? technician : undefined,
      });
      await loadMaintenance();
      setSelectedRequest(null);
      setTechnician("");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Unable to update request.");
    } finally {
      setUpdatingId(null);
    }
  }

  const grouped = useMemo(() => {
    return COLUMNS.reduce((acc, status) => {
      acc[status] = requests.filter((r) => r.status === status);
      return acc;
    }, {});
  }, [requests]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        <div className="text-lg font-semibold text-slate-600">
          Loading maintenance requests...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Workflow</h1>
          <p className="mt-1 text-gray-500">
            Track every maintenance request through its lifecycle.
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Something went wrong</p>
            <p className="mt-0.5 text-sm text-red-700">{error}</p>
          </div>
          <button
            type="button"
            onClick={loadMaintenance}
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-300 hover:bg-red-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Kanban */}
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[1100px] grid-cols-5 gap-4">
          {COLUMNS.map((column) => (
            <div key={column} className="rounded-xl border bg-gray-50">
              <div className="rounded-t-xl border-b bg-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{humanize(column)}</h2>
                  <span className="rounded-full bg-teal-100 px-2 py-1 text-xs">
                    {grouped[column].length}
                  </span>
                </div>
              </div>

              <div className="min-h-[500px] space-y-3 p-3">
                {grouped[column].length === 0 && (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-400">
                    No Requests
                  </div>
                )}

                {grouped[column].map((request) => {
                  const isUpdating = updatingId === request.id;
                  return (
                    <div
                      key={request.id}
                      className="rounded-xl border bg-white p-4 shadow-sm"
                    >
                      <h3 className="font-semibold">{assetLabel(request)}</h3>

                      <p className="mt-2 text-sm text-gray-600">{request.issueDescription}</p>

                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            PRIORITY_STYLES[request.priority] || "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {request.priority || "Medium"}
                        </span>

                        <span className="text-xs text-gray-400">
                          {request.createdAt
                            ? new Date(request.createdAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>

                      {request.technicianName && (
                        <div className="mt-3 text-sm">
                          <span className="font-medium">Technician:</span>{" "}
                          {request.technicianName}
                        </div>
                      )}

                      {column === "Resolved" && request.resolvedAt && (
                        <div className="mt-1 text-xs text-gray-400">
                          Resolved {new Date(request.resolvedAt).toLocaleDateString()}
                        </div>
                      )}

                      <div className="mt-4 space-y-2">
                        {(TRANSITIONS[request.status] || []).map((nextStatus) => (
                          <button
                            key={nextStatus}
                            disabled={isUpdating}
                            onClick={() => {
                              if (nextStatus === "TechnicianAssigned") {
                                setSelectedRequest({ request, nextStatus });
                              } else {
                                moveRequest(request, nextStatus);
                              }
                            }}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-sm text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isUpdating ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              getButtonIcon(nextStatus)
                            )}
                            {humanize(nextStatus)}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technician Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h2 className="text-2xl font-bold">Assign Technician</h2>

            <p className="mt-2 text-gray-500">{assetLabel(selectedRequest.request)}</p>

            <input
              type="text"
              placeholder="Technician Name"
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              className="mt-5 w-full rounded-lg border p-3"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setTechnician("");
                }}
                disabled={updatingId === selectedRequest.request.id}
                className="rounded-lg border px-5 py-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                disabled={!technician || updatingId === selectedRequest.request.id}
                onClick={() => moveRequest(selectedRequest.request, "TechnicianAssigned")}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2 text-white disabled:bg-gray-400"
              >
                {updatingId === selectedRequest.request.id && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}