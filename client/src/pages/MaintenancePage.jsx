import { useEffect, useMemo, useState } from "react";
import {
    CheckCircle,
    Wrench,
    PlayCircle,
    CheckCheck,
    XCircle,
    AlertTriangle,
} from "lucide-react";

// Later replace with API
// import {
//     getMaintenance,
//     updateMaintenance,
// } from "../api/maintenance";

const demoData = [
    {
        id: 1,
        assetId: 1,
        asset: "Dell Latitude 5430",
        issueDescription: "Screen Flickering",
        priority: "High",
        status: "Pending",
        technicianName: "",
        createdAt: new Date(),
    },
    {
        id: 2,
        assetId: 2,
        asset: "Projector Epson",
        issueDescription: "Lamp Failure",
        priority: "Medium",
        status: "Approved",
        technicianName: "",
        createdAt: new Date(),
    },
    {
        id: 3,
        assetId: 3,
        asset: "MacBook Pro",
        issueDescription: "Keyboard Issue",
        priority: "Low",
        status: "TechnicianAssigned",
        technicianName: "Rahul",
        createdAt: new Date(),
    },
    {
        id: 4,
        assetId: 4,
        asset: "HP LaserJet",
        issueDescription: "Paper Jam",
        priority: "High",
        status: "InProgress",
        technicianName: "Ajay",
        createdAt: new Date(),
    },
];

const transitions = {
    Pending: ["Approved", "Rejected"],
    Approved: ["TechnicianAssigned"],
    TechnicianAssigned: ["InProgress"],
    InProgress: ["Resolved"],
    Resolved: [],
    Rejected: [],
};

const columns = [
    "Pending",
    "Approved",
    "TechnicianAssigned",
    "InProgress",
    "Resolved",
];

const priorityColor = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
};

export default function MaintenancePage() {

    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(true);

    const [selectedRequest, setSelectedRequest] = useState(null);

    const [technician, setTechnician] = useState("");

    async function loadMaintenance() {

        setLoading(true);

        try {

            // Later

            // const { data } = await getMaintenance();
            // setRequests(data.data);

            setTimeout(() => {

                setRequests(demoData);

                setLoading(false);

            }, 400);

        } catch (err) {

            console.log(err);

            setLoading(false);

        }

    }

    useEffect(() => {

        loadMaintenance();

    }, []);

    async function moveRequest(request, nextStatus) {

        // Later connect backend

        // await updateMaintenance(request.id,{
        //     status:nextStatus,
        //     technicianName:technician
        // });

        setRequests((prev) =>
            prev.map((item) =>
                item.id === request.id
                    ? {
                          ...item,
                          status: nextStatus,
                          technicianName:
                              nextStatus ===
                              "TechnicianAssigned"
                                  ? technician
                                  : item.technicianName,
                      }
                    : item
            )
        );

        setSelectedRequest(null);

        setTechnician("");

    }

    const grouped = useMemo(() => {

        return columns.reduce((acc, status) => {

            acc[status] = requests.filter(
                (r) => r.status === status
            );

            return acc;

        }, {});

    }, [requests]);

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

    }    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="text-lg font-semibold">
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

                    <h1 className="text-3xl font-bold">
                        Maintenance Workflow
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Track every maintenance request through its lifecycle.
                    </p>

                </div>

            </div>

            {/* Kanban */}

            <div className="grid grid-cols-5 gap-4">

                {columns.map((column) => (

                    <div
                        key={column}
                        className="rounded-xl border bg-gray-50"
                    >

                        <div className="border-b bg-white px-4 py-3 rounded-t-xl">

                            <div className="flex items-center justify-between">

                                <h2 className="font-semibold">

                                    {column.replace(
                                        /([a-z])([A-Z])/g,
                                        "$1 $2"
                                    )}

                                </h2>

                                <span className="rounded-full bg-teal-100 px-2 py-1 text-xs">

                                    {grouped[column].length}

                                </span>

                            </div>

                        </div>

                        <div className="space-y-3 p-3 min-h-[500px]">

                            {grouped[column].length === 0 && (

                                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-400">

                                    No Requests

                                </div>

                            )}

                            {grouped[column].map((request) => (

                                <div
                                    key={request.id}
                                    className="rounded-xl bg-white border p-4 shadow-sm"
                                >

                                    <h3 className="font-semibold">

                                        {request.asset}

                                    </h3>

                                    <p className="mt-2 text-sm text-gray-600">

                                        {request.issueDescription}

                                    </p>

                                    <div className="mt-3 flex items-center justify-between">

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${priorityColor[request.priority]}`}
                                        >
                                            {request.priority}
                                        </span>

                                        <span className="text-xs text-gray-400">

                                            {new Date(
                                                request.createdAt
                                            ).toLocaleDateString()}

                                        </span>

                                    </div>

                                    {request.technicianName && (

                                        <div className="mt-3 text-sm">

                                            <span className="font-medium">

                                                Technician:

                                            </span>{" "}

                                            {request.technicianName}

                                        </div>

                                    )}

                                    <div className="mt-4 space-y-2">

                                        {transitions[
                                            request.status
                                        ].map((nextStatus) => (

                                            <button
                                                key={nextStatus}
                                                onClick={() => {

                                                    if (
                                                        nextStatus ===
                                                        "TechnicianAssigned"
                                                    ) {

                                                        setSelectedRequest(
                                                            {
                                                                request,
                                                                nextStatus,
                                                            }
                                                        );

                                                    } else {

                                                        moveRequest(
                                                            request,
                                                            nextStatus
                                                        );

                                                    }

                                                }}
                                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-sm text-white hover:bg-teal-700"
                                            >

                                                {getButtonIcon(
                                                    nextStatus
                                                )}

                                                {nextStatus.replace(
                                                    /([a-z])([A-Z])/g,
                                                    "$1 $2"
                                                )}

                                            </button>

                                        ))}

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                ))}

            </div>

            {/* Technician Modal */}

            {selectedRequest && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

                    <div className="w-full max-w-md rounded-xl bg-white p-6">

                        <h2 className="text-2xl font-bold">

                            Assign Technician

                        </h2>

                        <p className="mt-2 text-gray-500">

                            {selectedRequest.request.asset}

                        </p>

                        <input
                            type="text"
                            placeholder="Technician Name"
                            value={technician}
                            onChange={(e) =>
                                setTechnician(
                                    e.target.value
                                )
                            }
                            className="mt-5 w-full rounded-lg border p-3"
                        />

                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                onClick={() => {

                                    setSelectedRequest(
                                        null
                                    );

                                    setTechnician("");

                                }}
                                className="rounded-lg border px-5 py-2"
                            >

                                Cancel

                            </button>

                            <button
                                disabled={!technician}
                                onClick={() =>
                                    moveRequest(
                                        selectedRequest.request,
                                        "TechnicianAssigned"
                                    )
                                }
                                className="rounded-lg bg-teal-600 px-5 py-2 text-white disabled:bg-gray-400"
                            >

                                Assign

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}