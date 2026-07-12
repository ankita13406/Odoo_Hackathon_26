import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Search, Clock } from "lucide-react";

import { getBookings, createBooking } from "../api/booking";
import { getAssets } from "../api/asset";
import API from "../api/axios";

const statusStyle = {
    Upcoming: "bg-blue-100 text-blue-700",
    Ongoing: "bg-green-100 text-green-700",
    Completed: "bg-gray-100 text-gray-700",
    Cancelled: "bg-red-100 text-red-700",
};

// Backend responses are wrapped as { success, data: [...] }, but depending
// on whether a given api/*.js module pre-unwraps axios's response, what we
// receive here could be a raw axios response, an already-unwrapped
// envelope, or a plain array. Handle all three so a shape mismatch never
// crashes the page.
function extractList(res) {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
}

export default function BookingPage() {

    const [bookings, setBookings] = useState([]);

    const [assets, setAssets] = useState([]);

    const [employees, setEmployees] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [openModal, setOpenModal] = useState(false);

    const [form, setForm] = useState({

        assetId: "",

        bookedById: "",

        startTime: "",

        endTime: "",

    });

    async function loadBookings() {

        setLoading(true);

        try {

            const [

                bookingRes,

                assetRes,

                employeeRes,

            ] = await Promise.all([

                getBookings(),

                getAssets(),

                API.get("/employees"),

            ]);

            setBookings(extractList(bookingRes));

            setAssets(extractList(assetRes));

            setEmployees(extractList(employeeRes));

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        loadBookings();

    }, []);

    const employeeMap = useMemo(() => {

        const map = {};

        employees.forEach((employee) => {

            map[employee.id] = employee.name;

        });

        return map;

    }, [employees]);

    const filteredBookings = useMemo(() => {

        return bookings.filter((booking) => {

            const assetName =
                booking.asset?.name || "";

            return assetName
                .toLowerCase()
                .includes(search.toLowerCase());

        });

    }, [bookings, search]);

    async function submitBooking(e) {

        e.preventDefault();

        try {

            await createBooking({

                assetId: Number(form.assetId),

                bookedById: Number(form.bookedById),

                startTime: form.startTime,

                endTime: form.endTime,

            });

            await loadBookings();

            closeModal();

        } catch (err) {

            if (err.response?.status === 409) {

                alert("Slot unavailable");

                return;

            }

            alert(
                err.response?.data?.error ||
                "Booking Failed"
            );

        }

    }

    function closeModal() {

        setOpenModal(false);

        setForm({

            assetId: "",

            bookedById: "",

            startTime: "",

            endTime: "",

        });

    }

    function formatDate(value) {

        if (!value) return "-";

        return new Date(value).toLocaleString();

    }

    if (loading) {

        return (

            <div className="flex h-[80vh] items-center justify-center">

                <h2 className="text-xl font-semibold">

                    Loading Bookings...

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
                        Resource Booking
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Reserve bookable assets for employees.
                    </p>

                </div>

                <button
                    onClick={() => setOpenModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-white hover:bg-teal-700"
                >
                    <CalendarPlus size={18} />

                    Book Slot

                </button>

            </div>

            {/* Search */}

            <div className="relative">

                <Search
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                />

                <input
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    placeholder="Search Asset..."
                    className="w-full rounded-xl border py-3 pl-10 pr-4"
                />

            </div>

            {/* Booking Table */}

            <div className="overflow-hidden rounded-xl border bg-white">

                <table className="w-full">

                    <thead className="bg-gray-100">

                        <tr>

                            <th className="p-3 text-left">
                                Asset
                            </th>

                            <th className="p-3 text-left">
                                Employee
                            </th>

                            <th className="p-3 text-left">
                                Start
                            </th>

                            <th className="p-3 text-left">
                                End
                            </th>

                            <th className="p-3 text-left">
                                Status
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {filteredBookings.length === 0 ? (

                            <tr>

                                <td
                                    colSpan={5}
                                    className="p-8 text-center text-gray-400"
                                >

                                    No bookings found.

                                </td>

                            </tr>

                        ) : (

                            filteredBookings.map((booking) => (

                                <tr
                                    key={booking.id}
                                    className="border-t hover:bg-gray-50"
                                >

                                    <td className="p-3 font-medium">

                                        {booking.asset?.assetTag}

                                        <div className="text-sm text-gray-500">

                                            {booking.asset?.name}

                                        </div>

                                    </td>

                                    <td className="p-3">

                                        {employeeMap[booking.bookedById] ||
                                            `Employee #${booking.bookedById}`}

                                    </td>

                                    <td className="p-3">

                                        {formatDate(
                                            booking.startTime
                                        )}

                                    </td>

                                    <td className="p-3">

                                        {formatDate(
                                            booking.endTime
                                        )}

                                    </td>

                                    <td className="p-3">

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                statusStyle[booking.status] ||
                                                "bg-gray-100 text-gray-600"
                                            }`}
                                        >

                                            {booking.status}

                                        </span>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>
                       {/* Booking Modal */}

            {openModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

                        <h2 className="text-2xl font-bold">

                            Book Resource

                        </h2>

                        <form
                            onSubmit={submitBooking}
                            className="mt-6 space-y-5"
                        >

                            {/* Asset */}

                            <div>

                                <label className="mb-2 block text-sm font-medium">

                                    Asset

                                </label>

                                <select
                                    required
                                    value={form.assetId}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            assetId: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border p-3"
                                >

                                    <option value="">

                                        Select Asset

                                    </option>

                                    {assets
                                        .filter(asset => asset.isBookable)
                                        .map(asset => (

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
                                    value={form.bookedById}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            bookedById: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border p-3"
                                >

                                    <option value="">

                                        Select Employee

                                    </option>

                                    {employees.map(employee => (

                                        <option
                                            key={employee.id}
                                            value={employee.id}
                                        >

                                            {employee.name}

                                        </option>

                                    ))}

                                </select>

                            </div>

                            {/* Date Time */}

                            <div className="grid grid-cols-2 gap-4">

                                <div>

                                    <label className="mb-2 block text-sm font-medium">

                                        Start Time

                                    </label>

                                    <input
                                        type="datetime-local"
                                        required
                                        value={form.startTime}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                startTime: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border p-3"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-medium">

                                        End Time

                                    </label>

                                    <input
                                        type="datetime-local"
                                        required
                                        value={form.endTime}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                endTime: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border p-3"
                                    />

                                </div>

                            </div>

                            <div className="flex justify-end gap-3 pt-2">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border px-5 py-2 hover:bg-gray-50"
                                >

                                    Cancel

                                </button>

                                <button
                                    type="submit"
                                    className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2 text-white hover:bg-teal-700"
                                >

                                    <Clock size={16} />

                                    Book Slot

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}