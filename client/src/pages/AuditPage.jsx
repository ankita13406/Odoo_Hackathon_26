import { useEffect, useMemo, useState } from "react";
import {
    ClipboardCheck,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ShieldAlert,
} from "lucide-react";

// Later
// import {
//     getAuditCycles,
//     getAuditItems,
//     updateAuditItem,
//     closeAuditCycle,
// } from "../api/audit";

const demoCycle = {
    id: 1,
    name: "July 2026 Asset Audit",
    department: "All Departments",
    status: "Open",
};

const demoItems = [
    {
        id: 1,
        assetId: 1,
        assetTag: "AF-0001",
        assetName: "Dell Latitude 5430",
        location: "IT Room",
        assignedTo: "Rahul",
        result: "Verified",
        notes: "",
    },
    {
        id: 2,
        assetId: 2,
        assetTag: "AF-0002",
        assetName: "Projector Epson",
        location: "Meeting Room",
        assignedTo: "Ankit",
        result: "Missing",
        notes: "",
    },
    {
        id: 3,
        assetId: 3,
        assetTag: "AF-0003",
        assetName: "MacBook Pro",
        location: "Design Team",
        assignedTo: "Sneha",
        result: "Damaged",
        notes: "Broken Display",
    },
    {
        id: 4,
        assetId: 4,
        assetTag: "AF-0004",
        assetName: "HP Printer",
        location: "Reception",
        assignedTo: "Admin",
        result: "Verified",
        notes: "",
    },
];

const RESULT_OPTIONS = [
    "Verified",
    "Missing",
    "Damaged",
];

const badgeStyles = {
    Verified:
        "bg-green-100 text-green-700",

    Missing:
        "bg-red-100 text-red-700",

    Damaged:
        "bg-orange-100 text-orange-700",
};

export default function AuditPage() {

    const [cycle, setCycle] =
        useState(null);

    const [items, setItems] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [closing, setClosing] =
        useState(false);

    async function loadAudit() {

        setLoading(true);

        try {

            // Later

            // const cycleRes =
            // await getAuditCycles();

            // const current =
            // cycleRes.data.data[0];

            // setCycle(current);

            // const itemsRes =
            // await getAuditItems(
            // current.id
            // );

            // setItems(
            // itemsRes.data.data
            // );

            setTimeout(() => {

                setCycle(demoCycle);

                setItems(demoItems);

                setLoading(false);

            }, 400);

        } catch (err) {

            console.log(err);

            setLoading(false);

        }

    }

    useEffect(() => {

        loadAudit();

    }, []);

    function updateResult(
        id,
        value
    ) {

        setItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          result: value,
                      }
                    : item
            )
        );

        // Later

        // await updateAuditItem(
        // id,
        // {
        // result:value
        // }
        // );

    }

    const flaggedCount =
        useMemo(() => {

            return items.filter(
                (item) =>
                    item.result ===
                        "Missing" ||
                    item.result ===
                        "Damaged"
            ).length;

        }, [items]);

    async function handleCloseCycle() {

        setClosing(true);

        try {

            // Later

            // await closeAuditCycle(
            // cycle.id
            // );

            alert(
                `Audit Closed Successfully!\n\nFlagged Items : ${flaggedCount}`
            );

        } catch (err) {

            console.log(err);

        }

        setClosing(false);

    }
        if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <h2 className="text-xl font-semibold">
                    Loading Audit Cycle...
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
                        Audit Cycle
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Verify organizational assets and identify discrepancies.
                    </p>

                </div>

                <span
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                        cycle.status === "Open"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                >
                    {cycle.status}
                </span>

            </div>

            {/* Summary */}

            <div className="grid grid-cols-3 gap-5">

                <div className="rounded-xl border bg-white p-5">

                    <div className="flex items-center gap-3">

                        <ClipboardCheck className="text-blue-600" />

                        <div>

                            <p className="text-gray-500 text-sm">
                                Audit Cycle
                            </p>

                            <h3 className="font-bold">
                                {cycle.name}
                            </h3>

                        </div>

                    </div>

                </div>

                <div className="rounded-xl border bg-white p-5">

                    <div className="flex items-center gap-3">

                        <ShieldAlert className="text-purple-600" />

                        <div>

                            <p className="text-gray-500 text-sm">
                                Department
                            </p>

                            <h3 className="font-bold">
                                {cycle.department}
                            </h3>

                        </div>

                    </div>

                </div>

                <div className="rounded-xl border bg-white p-5">

                    <div className="flex items-center gap-3">

                        <AlertTriangle className="text-red-600" />

                        <div>

                            <p className="text-gray-500 text-sm">
                                Flagged Assets
                            </p>

                            <h3 className="text-2xl font-bold text-red-600">
                                {flaggedCount}
                            </h3>

                        </div>

                    </div>

                </div>

            </div>

            {/* Flagged Banner */}

            {flaggedCount > 0 && (

                <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-5">

                    <div className="flex items-center gap-3">

                        <AlertTriangle className="text-red-600" />

                        <div>

                            <h3 className="font-semibold text-red-700">
                                {flaggedCount} discrepancies detected
                            </h3>

                            <p className="text-sm text-red-600">
                                Missing and damaged assets will be reported when this audit cycle closes.
                            </p>

                        </div>

                    </div>

                </div>

            )}

            {/* Audit Table */}

            <div className="overflow-hidden rounded-xl border bg-white">

                <table className="w-full">

                    <thead className="bg-gray-100">

                        <tr>

                            <th className="p-3 text-left">
                                Asset Tag
                            </th>

                            <th className="p-3 text-left">
                                Asset
                            </th>

                            <th className="p-3 text-left">
                                Location
                            </th>

                            <th className="p-3 text-left">
                                Assigned To
                            </th>

                            <th className="p-3 text-left">
                                Verification
                            </th>

                            <th className="p-3 text-left">
                                Notes
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {items.map((item) => (

                            <tr
                                key={item.id}
                                className="border-t"
                            >

                                <td className="p-3 font-medium">

                                    {item.assetTag}

                                </td>

                                <td className="p-3">

                                    {item.assetName}

                                </td>

                                <td className="p-3">

                                    {item.location}

                                </td>

                                <td className="p-3">

                                    {item.assignedTo}

                                </td>

                                <td className="p-3">

                                    <select
                                        value={item.result}
                                        onChange={(e) =>
                                            updateResult(
                                                item.id,
                                                e.target.value
                                            )
                                        }
                                        className={`rounded-lg border px-3 py-2 text-sm ${badgeStyles[item.result]}`}
                                    >

                                        {RESULT_OPTIONS.map(
                                            (option) => (

                                                <option
                                                    key={option}
                                                    value={option}
                                                >
                                                    {option}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </td>

                                <td className="p-3">

                                    <input
                                        value={item.notes}
                                        onChange={(e) =>
                                            setItems((prev) =>
                                                prev.map(
                                                    (audit) =>
                                                        audit.id ===
                                                        item.id
                                                            ? {
                                                                  ...audit,
                                                                  notes:
                                                                      e
                                                                          .target
                                                                          .value,
                                                              }
                                                            : audit
                                                )
                                            )
                                        }
                                        placeholder="Optional notes..."
                                        className="w-full rounded-lg border p-2"
                                    />

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* Footer */}

            <div className="flex justify-end">

                <button
                    disabled={closing}
                    onClick={handleCloseCycle}
                    className="flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-white hover:bg-teal-700 disabled:bg-gray-400"
                >

                    <CheckCircle2 size={18} />

                    {closing
                        ? "Closing..."
                        : "Close Audit Cycle"}

                </button>

            </div>

        </div>
    );
}