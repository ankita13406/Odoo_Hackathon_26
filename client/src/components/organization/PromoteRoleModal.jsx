import { useEffect, useState } from "react";

export default function PromoteRoleModal({
    open,
    onClose,
    employee,
    onSubmit,
}) {
    const [role, setRole] = useState("DepartmentHead");

    useEffect(() => {
        if (!employee) return;

        // Backend only accepts these two roles
        if (
            employee.role === "DepartmentHead" ||
            employee.role === "AssetManager"
        ) {
            setRole(employee.role);
        } else {
            setRole("DepartmentHead");
        }
    }, [employee]);

    if (!open || !employee) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(role);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

                {/* Header */}
                <div className="border-b p-6">
                    <h2 className="text-2xl font-bold">
                        Manage Employee Role
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Promote employee to a management role.
                    </p>
                </div>

                {/* Body */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 p-6"
                >

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Employee
                        </label>

                        <input
                            value={employee.name}
                            disabled
                            className="w-full rounded-lg border bg-gray-100 p-3"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Email
                        </label>

                        <input
                            value={employee.email}
                            disabled
                            className="w-full rounded-lg border bg-gray-100 p-3"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Current Role
                        </label>

                        <input
                            value={employee.role}
                            disabled
                            className="w-full rounded-lg border bg-gray-100 p-3"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            New Role
                        </label>

                        <select
                            value={role}
                            onChange={(e) =>
                                setRole(e.target.value)
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="DepartmentHead">
                                Department Head
                            </option>

                            <option value="AssetManager">
                                Asset Manager
                            </option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border px-5 py-2 hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-lg bg-teal-600 px-5 py-2 text-white hover:bg-teal-700"
                        >
                            Save Changes
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
}