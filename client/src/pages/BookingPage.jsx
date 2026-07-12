import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Search, Clock } from "lucide-react";

// Later
// import {
//     getBookings,
//     createBooking,
// } from "../api/booking";

const demoBookings = [
    {
        id: 1,
        assetId: 1,
        asset: "Dell Laptop",
        bookedBy: "Rahul",
        startTime: "2026-07-12T10:00",
        endTime: "2026-07-12T12:00",
        status: "Upcoming",
    },
    {
        id: 2,
        assetId: 2,
        asset: "Projector",
        bookedBy: "Amit",
        startTime: "2026-07-12T13:00",
        endTime: "2026-07-12T15:00",
        status: "Ongoing",
    },
];

const statusStyle = {
    Upcoming: "bg-blue-100 text-blue-700",
    Ongoing: "bg-green-100 text-green-700",
    Completed: "bg-gray-100 text-gray-700",
    Cancelled: "bg-red-100 text-red-700",
};

export default function BookingPage() {

    const [bookings, setBookings] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [openModal, setOpenModal] = useState(false);

    const [form, setForm] = useState({
        asset: "",
        bookedBy: "",
        startTime: "",
        endTime: "",
    });

    async function loadBookings() {

        setLoading(true);

        try {

            // Later

            // const { data } =
            // await getBookings();

            // setBookings(data.data);

            setTimeout(() => {

                setBookings(demoBookings);

                setLoading(false);

            }, 300);

        } catch (err) {

            console.log(err);

            setLoading(false);

        }

    }

    useEffect(() => {

        loadBookings();

    }, []);

    const filteredBookings = useMemo(() => {

        return bookings.filter((booking) =>

            booking.asset
                .toLowerCase()
                .includes(search.toLowerCase())

            ||

            booking.bookedBy
                .toLowerCase()
                .includes(search.toLowerCase())

        );

    }, [bookings, search]);

    async function submitBooking(e) {

        e.preventDefault();

        // Later

        // await createBooking(form);

        const booking = {

            id: Date.now(),

            ...form,

            status: "Upcoming",

        };

        setBookings((prev) => [

            booking,

            ...prev,

        ]);

        setForm({

            asset: "",

            bookedBy: "",

            startTime: "",

            endTime: "",

        });

        setOpenModal(false);

    }

    function closeModal() {

        setOpenModal(false);

        setForm({

            asset: "",

            bookedBy: "",

            startTime: "",

            endTime: "",

        });

    }

    function formatDate(value) {

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
                        Reserve company assets for employees.
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
                    placeholder="Search asset or employee..."
                    className="w-full rounded-xl border py-3 pl-10 pr-4"
                />

            </div>

            {/* Table */}

            <div className="overflow-hidden rounded-xl border bg-white">

                <table className="w-full">

                    <thead className="bg-gray-100">

                        <tr>

                            <th className="p-3 text-left">
                                Asset
                            </th>

                            <th className="p-3 text-left">
                                Booked By
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
                                    className="border-t"
                                >

                                    <td className="p-3">

                                        {booking.asset}

                                    </td>

                                    <td className="p-3">

                                        {booking.bookedBy}

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
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle[booking.status]}`}
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

            {/* Modal */}

            {openModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

                    <div className="w-full max-w-lg rounded-xl bg-white p-6">

                        <h2 className="text-2xl font-bold">

                            Book Resource

                        </h2>

                        <form
                            onSubmit={submitBooking}
                            className="mt-6 space-y-4"
                        >

                            <div>

                                <label className="mb-2 block text-sm font-medium">

                                    Asset

                                </label>

                                <input
                                    required
                                    value={form.asset}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            asset:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    placeholder="Dell Laptop"
                                    className="w-full rounded-lg border p-3"
                                />

                            </div>

                            <div>

                                <label className="mb-2 block text-sm font-medium">

                                    Employee

                                </label>

                                <input
                                    required
                                    value={form.bookedBy}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            bookedBy:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    placeholder="Rahul"
                                    className="w-full rounded-lg border p-3"
                                />

                            </div>

                            <div className="grid grid-cols-2 gap-4">

                                <div>

                                    <label className="mb-2 block text-sm font-medium">

                                        Start

                                    </label>

                                    <input
                                        type="datetime-local"
                                        required
                                        value={
                                            form.startTime
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                startTime:
                                                    e.target
                                                        .value,
                                            })
                                        }
                                        className="w-full rounded-lg border p-3"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-medium">

                                        End

                                    </label>

                                    <input
                                        type="datetime-local"
                                        required
                                        value={
                                            form.endTime
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                endTime:
                                                    e.target
                                                        .value,
                                            })
                                        }
                                        className="w-full rounded-lg border p-3"
                                    />

                                </div>

                            </div>

                            <div className="flex justify-end gap-3 pt-4">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border px-5 py-2"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2 text-white hover:bg-teal-700"
                                >
                                    <Clock size={16} />

                                    Book
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}