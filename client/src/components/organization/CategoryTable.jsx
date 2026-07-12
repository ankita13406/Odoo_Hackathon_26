import { Edit } from "lucide-react";

export default function CategoryTable({
    categories,
    onEdit,
}) {
    if (!categories.length) {
        return (
            <div className="rounded-lg border bg-white p-10 text-center text-gray-500">
                No categories found.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border bg-white">

            <table className="min-w-full">

                <thead className="bg-gray-50">

                    <tr>

                        <th className="px-5 py-3 text-left text-sm font-semibold">
                            Category
                        </th>

                        <th className="px-5 py-3 text-left text-sm font-semibold">
                            Extra Fields
                        </th>

                        <th className="px-5 py-3 text-center text-sm font-semibold">
                            Actions
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {categories.map((category) => (

                        <tr
                            key={category.id}
                            className="border-t"
                        >

                            <td className="px-5 py-4 font-medium">
                                {category.name}
                            </td>

                            <td className="px-5 py-4">

                                {Object.keys(category.extraFields || {}).length === 0 ? (
                                    <span className="text-gray-400">
                                        No Extra Fields
                                    </span>
                                ) : (
                                    <div className="flex flex-wrap gap-2">

                                        {Object.entries(category.extraFields).map(
                                            ([key, value]) => (

                                                <span
                                                    key={key}
                                                    className="rounded-full bg-slate-100 px-3 py-1 text-xs"
                                                >
                                                    {key}: {String(value)}
                                                </span>

                                            )
                                        )}

                                    </div>
                                )}

                            </td>

                            <td className="px-5 py-4">

                                <div className="flex justify-center">

                                    <button
                                        onClick={() => onEdit(category)}
                                    >
                                        <Edit
                                            size={18}
                                            className="text-blue-600"
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