import { useForm } from "react-hook-form";
import { useEffect } from "react";

export default function DepartmentModal({
    open,
    onClose,
    onSubmit,
    department,
    departments,
    employees,
}) {
    const {
        register,
        handleSubmit,
        reset,
    } = useForm();

    useEffect(() => {
        if (department) {
            reset(department);
        } else {
            reset({
                status: "Active",
            });
        }
    }, [department, reset]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

            <div className="w-full max-w-lg rounded-xl bg-white p-6">

                <h2 className="mb-6 text-2xl font-bold">

                    {department
                        ? "Edit Department"
                        : "Add Department"}

                </h2>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                >

                    <input
                        placeholder="Department Name"
                        {...register("name", {
                            required: true,
                        })}
                        className="w-full rounded-lg border p-3"
                    />

                    <select
                        {...register("parentDeptId")}
                        className="w-full rounded-lg border p-3"
                    >

                        <option value="">
                            No Parent
                        </option>

                        {departments.map((d) => (

                            <option
                                key={d.id}
                                value={d.id}
                            >
                                {d.name}
                            </option>

                        ))}

                    </select>

                    <select
                        {...register("headId")}
                        className="w-full rounded-lg border p-3"
                    >

                        <option value="">
                            Department Head
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

                    <select
                        {...register("status")}
                        className="w-full rounded-lg border p-3"
                    >

                        <option>
                            Active
                        </option>

                        <option>
                            Inactive
                        </option>

                    </select>

                    <div className="flex justify-end gap-3">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border px-5 py-2"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-lg bg-teal-600 px-5 py-2 text-white"
                        >
                            Save
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}