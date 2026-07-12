import { useEffect, useMemo, useState } from "react";
import {
    ArrowRightLeft,
    AlertTriangle,
    Package,
    User,
    Calendar,
    History,
} from "lucide-react";

import {
    getAssets,
    getAssetHistory,
} from "../api/asset";

import API from "../api/axios";

// Demo fallback
const demoHistory = {
    allocations: [],
    maintenance: [],
};

export default function AllocationPage() {

    const [assets, setAssets] = useState([]);

    const [employees, setEmployees] = useState([]);

    const [selectedAsset, setSelectedAsset] = useState("");

    const [selectedEmployee, setSelectedEmployee] =
        useState("");

    const [expectedReturnDate,
        setExpectedReturnDate] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [historyLoading,
        setHistoryLoading] =
        useState(false);

    const [allocationHistory,
        setAllocationHistory] =
        useState(demoHistory);

    const [conflict,
        setConflict] =
        useState(null);

    const [transferReason,
        setTransferReason] =
        useState("");

    const [transferEmployee,
        setTransferEmployee] =
        useState("");

    async function loadPage() {

        setLoading(true);

        try {

            const [

                assetRes,

                employeeRes,

            ] = await Promise.all([

                getAssets(),

                API.get("/employees"),

            ]);

            setAssets(assetRes.data.data);

            setEmployees(employeeRes.data.data);

        } catch (err) {

            console.log(err);

        }

        setLoading(false);

    }

    useEffect(() => {

        loadPage();

    }, []);

    async function loadHistory(assetId) {

        if (!assetId) {

            setAllocationHistory(demoHistory);

            return;

        }

        setHistoryLoading(true);

        try {

            const res =
                await getAssetHistory(assetId);

            setAllocationHistory(
                res.data.data
            );

        } catch (err) {

            console.log(err);

        }

        setHistoryLoading(false);

    }

    useEffect(() => {

        if (selectedAsset) {

            loadHistory(selectedAsset);

        }

    }, [selectedAsset]);

    const selectedAssetObject =
        useMemo(() => {

            return assets.find(
                a =>
                    String(a.id) ===
                    String(selectedAsset)
            );

        }, [assets, selectedAsset]);

    const selectedEmployeeObject =
        useMemo(() => {

            return employees.find(
                e =>
                    String(e.id) ===
                    String(selectedEmployee)
            );

        }, [employees, selectedEmployee]);
            async function handleAllocate(e) {

        e.preventDefault();

        setConflict(null);

        try {

            const payload = {

                assetId: Number(selectedAsset),

                employeeId: selectedEmployee
                    ? Number(selectedEmployee)
                    : null,

                departmentId: null,

                expectedReturnDate:
                    expectedReturnDate || null,

            };

            await API.post(
                "/allocation/allocate",
                payload
            );

            alert("Asset Allocated Successfully");

            setSelectedAsset("");

            setSelectedEmployee("");

            setExpectedReturnDate("");

            loadPage();

        } catch (err) {

            if (err.response?.status === 409) {

                setConflict(
                    err.response.data.data
                );

            } else {

                alert(
                    err.response?.data?.error ||
                    "Allocation Failed"
                );

            }

        }

    }

    async function handleTransferRequest() {

        try {

            await API.post(
                "/allocation/transfer-request",
                {

                    assetId: Number(selectedAsset),

                    fromEmployeeId:
                        conflict?.currentHolder?.id,

                    toEmployeeId:
                        Number(
                            transferEmployee
                        ),

                    reason: transferReason,

                }
            );

            alert(
                "Transfer Request Created"
            );

            setConflict(null);

            setTransferReason("");

            setTransferEmployee("");

        } catch (err) {

            alert(
                err.response?.data?.error ||
                "Transfer Failed"
            );

        }

    }

    async function handleReturn(
        allocationId
    ) {

        try {

            await API.post(
                `/allocation/return/${allocationId}`,
                {

                    conditionNotes:
                        "Returned via UI",

                }
            );

            alert(
                "Asset Returned"
            );

            loadHistory(selectedAsset);

            loadPage();

        } catch (err) {

            alert(
                err.response?.data?.error ||
                "Return Failed"
            );

        }

    }

    function formatDate(date) {

        if (!date) return "-";

        return new Date(date)
            .toLocaleDateString();

    }

    function resetTransfer() {

        setConflict(null);

        setTransferEmployee("");

        setTransferReason("");

    }
        if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <h2 className="text-xl font-semibold">
                    Loading Allocation Module...
                </h2>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Header */}

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-3xl font-bold">
                        Allocation & Transfer
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Allocate assets, resolve conflicts and manage transfers.
                    </p>

                </div>

            </div>

            <div className="grid gap-6 lg:grid-cols-2">

                {/* LEFT PANEL */}

                <div className="rounded-xl border bg-white p-6 shadow-sm">

                    <h2 className="mb-5 text-xl font-semibold">
                        Allocate Asset
                    </h2>

                    <form
                        onSubmit={handleAllocate}
                        className="space-y-4"
                    >

                        {/* Asset */}

                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Asset
                            </label>

                            <select
                                required
                                value={selectedAsset}
                                onChange={(e) =>
                                    setSelectedAsset(
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border p-3"
                            >

                                <option value="">
                                    Select Asset
                                </option>

                                {assets.map((asset) => (

                                    <option
                                        key={asset.id}
                                        value={asset.id}
                                    >
                                        {asset.assetTag} - {asset.name}
                                    </option>

                                ))}

                            </select>

                        </div>

                        {/* Employee */}

                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Employee
                            </label>

                            <select
                                required
                                value={selectedEmployee}
                                onChange={(e) =>
                                    setSelectedEmployee(
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border p-3"
                            >

                                <option value="">
                                    Select Employee
                                </option>

                                {employees.map((emp) => (

                                    <option
                                        key={emp.id}
                                        value={emp.id}
                                    >
                                        {emp.name}
                                    </option>

                                ))}

                            </select>

                        </div>

                        {/* Expected Return */}

                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Expected Return Date
                            </label>

                            <input
                                type="date"
                                value={expectedReturnDate}
                                onChange={(e) =>
                                    setExpectedReturnDate(
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border p-3"
                            />

                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-teal-600 py-3 font-medium text-white hover:bg-teal-700"
                        >
                            Allocate Asset
                        </button>

                    </form>

                    {/* Conflict Banner */}

                    {conflict && (

                        <div className="mt-6 rounded-xl border-l-4 border-red-500 bg-red-50 p-5">

                            <div className="flex items-start gap-3">

                                <AlertTriangle
                                    className="mt-1 text-red-600"
                                    size={24}
                                />

                                <div className="flex-1">

                                    <h3 className="font-semibold text-red-700">

                                        Allocation Conflict

                                    </h3>

                                    <p className="mt-2 text-sm text-red-600">

                                        This asset is already allocated to

                                        <strong>

                                            {" "}
                                            {conflict.currentHolder?.name}

                                        </strong>

                                    </p>

                                    <p className="mt-1 text-sm text-gray-700">

                                        Employee ID :

                                        {" "}
                                        {conflict.currentHolder?.id}

                                    </p>

                                </div>

                            </div>

                            {/* Transfer Form */}

                            <div className="mt-5 space-y-4">

                                <h4 className="font-semibold">
                                    Create Transfer Request
                                </h4>

                                <select
                                    value={transferEmployee}
                                    onChange={(e) =>
                                        setTransferEmployee(
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border p-3"
                                >

                                    <option value="">
                                        Transfer To
                                    </option>

                                    {employees
                                        .filter(
                                            (e) =>
                                                e.id !==
                                                conflict.currentHolder?.id
                                        )
                                        .map((emp) => (

                                            <option
                                                key={emp.id}
                                                value={emp.id}
                                            >
                                                {emp.name}
                                            </option>

                                        ))}

                                </select>

                                <textarea
                                    rows={3}
                                    value={transferReason}
                                    onChange={(e) =>
                                        setTransferReason(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Reason for transfer..."
                                    className="w-full rounded-lg border p-3"
                                />

                                <div className="flex gap-3">

                                    <button
                                        onClick={
                                            handleTransferRequest
                                        }
                                        className="flex-1 rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
                                    >
                                        Submit Transfer Request
                                    </button>

                                    <button
                                        onClick={resetTransfer}
                                        className="rounded-lg border px-6"
                                    >
                                        Cancel
                                    </button>

                                </div>

                            </div>

                        </div>

                    )}

                </div>
                                {/* RIGHT PANEL */}

                <div className="rounded-xl border bg-white p-6 shadow-sm">

                    <div className="mb-5 flex items-center gap-2">

                        <History size={22} />

                        <h2 className="text-xl font-semibold">
                            Asset History
                        </h2>

                    </div>

                    {!selectedAsset ? (

                        <div className="flex h-72 items-center justify-center rounded-lg border border-dashed">

                            <div className="text-center text-gray-500">

                                <Package
                                    className="mx-auto mb-3"
                                    size={40}
                                />

                                <p>Select an asset to view history.</p>

                            </div>

                        </div>

                    ) : historyLoading ? (

                        <div className="flex h-72 items-center justify-center">

                            Loading History...

                        </div>

                    ) : (

                        <div className="space-y-6">

                            {/* Allocation History */}

                            <div>

                                <h3 className="mb-3 font-semibold">

                                    Allocation History

                                </h3>

                                {allocationHistory.allocations?.length === 0 ? (

                                    <p className="text-gray-400">

                                        No allocation history.

                                    </p>

                                ) : (

                                    <div className="space-y-4">

                                        {allocationHistory.allocations.map((item) => (

                                            <div
                                                key={item.id}
                                                className="rounded-lg border p-4"
                                            >

                                                <div className="flex items-center justify-between">

                                                    <div>

                                                        <h4 className="font-semibold">

                                                            Allocation #{item.id}

                                                        </h4>

                                                        <p className="mt-1 text-sm text-gray-500">

                                                            Employee ID :
                                                            {" "}
                                                            {item.employeeId ?? "-"}

                                                        </p>

                                                    </div>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                            item.status === "Active"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-gray-100 text-gray-700"
                                                        }`}
                                                    >
                                                        {item.status}
                                                    </span>

                                                </div>

                                                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">

                                                    <div>

                                                        <strong>
                                                            Allocated
                                                        </strong>

                                                        <p>

                                                            {formatDate(
                                                                item.allocatedAt
                                                            )}

                                                        </p>

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            Expected Return
                                                        </strong>

                                                        <p>

                                                            {formatDate(
                                                                item.expectedReturnDate
                                                            )}

                                                        </p>

                                                    </div>

                                                </div>

                                                {item.returnedAt && (

                                                    <div className="mt-3 text-sm">

                                                        <strong>

                                                            Returned

                                                        </strong>

                                                        <p>

                                                            {formatDate(
                                                                item.returnedAt
                                                            )}

                                                        </p>

                                                    </div>

                                                )}

                                                {item.checkInNotes && (

                                                    <div className="mt-3 rounded bg-gray-50 p-3 text-sm">

                                                        <strong>

                                                            Notes

                                                        </strong>

                                                        <p>

                                                            {item.checkInNotes}

                                                        </p>

                                                    </div>

                                                )}

                                                {item.status === "Active" && (

                                                    <button
                                                        onClick={() =>
                                                            handleReturn(item.id)
                                                        }
                                                        className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                                                    >
                                                        Return Asset
                                                    </button>

                                                )}

                                            </div>

                                        ))}

                                    </div>

                                )}

                            </div>

                            {/* Maintenance History */}

                            <div>

                                <h3 className="mb-3 font-semibold">

                                    Maintenance History

                                </h3>

                                {allocationHistory.maintenance?.length === 0 ? (

                                    <p className="text-gray-400">

                                        No maintenance records.

                                    </p>

                                ) : (

                                    <div className="space-y-3">

                                        {allocationHistory.maintenance.map((item) => (

                                            <div
                                                key={item.id}
                                                className="rounded-lg border p-4"
                                            >

                                                <div className="flex items-center justify-between">

                                                    <h4 className="font-semibold">

                                                        {item.issueDescription}

                                                    </h4>

                                                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700">

                                                        {item.status}

                                                    </span>

                                                </div>

                                                <div className="mt-2 text-sm text-gray-600">

                                                    Priority :
                                                    {" "}
                                                    {item.priority}

                                                </div>

                                                <div className="mt-1 text-sm text-gray-500">

                                                    Created :
                                                    {" "}
                                                    {formatDate(item.createdAt)}

                                                </div>

                                            </div>

                                        ))}

                                    </div>

                                )}

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}