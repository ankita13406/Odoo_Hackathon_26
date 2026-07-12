import { Edit, Trash2, Ban } from "lucide-react";

export default function DepartmentTable({
    departments,
    onEdit,
    onDeactivate,
    onDelete,
}) {
    if (!departments.length) {
        return (
            <div className="rounded-lg border bg-white p-10 text-center text-gray-500">
                No departments found.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border bg-white">

            <table className="min-w-full">

                <thead className="bg-gray-50">

                    <tr>

                        <th className="px-5 py-3 text-left text-sm font-semibold">
                            Name
                        </th>

                        <th className="px-5 py-3 text-left text-sm font-semibold">
                            Parent
                        </th>

                        <th className="px-5 py-3 text-left text-sm font-semibold">
                            Head
                        </th>

                        <th className="px-5 py-3 text-left text-sm font-semibold">
                            Status
                        </th>

                        <th className="px-5 py-3 text-center text-sm font-semibold">
                            Actions
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {departments.map((dept) => (

                        <tr
                            key={dept.id}
                            className="border-t"
                        >

                            <td className="px-5 py-4">
                                {dept.name}
                            </td>

                            <td className="px-5 py-4">
                                {dept.parent?.name || "-"}
                            </td>

                            <td className="px-5 py-4">
                                {dept.headId || "-"}
                            </td>

                            <td className="px-5 py-4">

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        dept.status === "Active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {dept.status}
                                </span>

                            </td>

                            <td className="px-5 py-4">

                                <div className="flex justify-center gap-3">

                                    <button
                                        onClick={() => onEdit(dept)}
                                    >
                                        <Edit
                                            size={18}
                                            className="text-blue-600"
                                        />
                                    </button>

                                    <button
                                        onClick={() =>
                                            onDeactivate(dept.id)
                                        }
                                    >
                                        <Ban
                                            size={18}
                                            className="text-yellow-600"
                                        />
                                    </button>

                                    <button
                                        onClick={() =>
                                            onDelete(dept.id)
                                        }
                                    >
                                        <Trash2
                                            size={18}
                                            className="text-red-600"
                                        />
                                    </button>

                                </div>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}