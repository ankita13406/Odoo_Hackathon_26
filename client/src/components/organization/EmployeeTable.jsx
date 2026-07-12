import { ArrowUpCircle } from "lucide-react";

export default function EmployeeTable({
    employees,
    onPromote,
}) {
    if (!employees.length) {
        return (
            <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
                No employees found.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border bg-white">

            <table className="min-w-full">

                <thead className="bg-gray-50">

                    <tr>

                        <th className="px-5 py-3 text-left text-sm font-semibold">
                            Employee
                        </th>

                        <th className="px-5 py-3 text-left text-sm font-semibold">
                            Email
                        </th>

                        <th className="px-5 py-3 text-left text-sm font-semibold">
                            Department
                        </th>

                        <th className="px-5 py-3 text-left text-sm font-semibold">
                            Role
                        </th>

                        <th className="px-5 py-3 text-left text-sm font-semibold">
                            Status
                        </th>

                        <th className="px-5 py-3 text-center text-sm font-semibold">
                            Action
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {employees.map((employee) => (

                        <tr
                            key={employee.id}
                            className="border-t hover:bg-gray-50"
                        >

                            <td className="px-5 py-4 font-medium">
                                {employee.name}
                            </td>

                            <td className="px-5 py-4">
                                {employee.email}
                            </td>

                            <td className="px-5 py-4">
                                {employee.department?.name || "-"}
                            </td>

                            <td className="px-5 py-4">

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold
                                    ${
                                        employee.role === "Admin"
                                            ? "bg-red-100 text-red-700"
                                            : employee.role === "AssetManager"
                                            ? "bg-blue-100 text-blue-700"
                                            : employee.role === "DepartmentHead"
                                            ? "bg-purple-100 text-purple-700"
                                            : "bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    {employee.role}
                                </span>

                            </td>

                            <td className="px-5 py-4">

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold
                                    ${
                                        employee.status === "Active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {employee.status}
                                </span>

                            </td>

                            <td className="px-5 py-4">

                                <div className="flex justify-center">

                                    {employee.role === "Employee" ? (

                                        <button
                                            onClick={() =>
                                                onPromote(employee)
                                            }
                                            className="flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-sm text-white hover:bg-teal-700"
                                        >
                                            <ArrowUpCircle size={16} />
                                            Promote
                                        </button>

                                    ) : (

                                        <span className="text-gray-400 text-sm">
                                            —
                                        </span>

                                    )}

                                </div>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}