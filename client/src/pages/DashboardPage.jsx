import { useMemo, useState } from "react";
import {
    Boxes,
    Laptop,
    Building2,
    Users,
    Wrench,
    AlertTriangle,
    Activity,
    ArrowUpRight,
} from "lucide-react";

// Later
// import { getDashboard } from "../api/dashboard";

const dashboardData = {

    kpis: {

        totalAssets: 6,

        available: 4,

        allocated: 2,

        maintenance: 8,

        departments: 12,

        employees: 14,

    },

    overdueCount: 3,

    overdue: [

        {
            id: 1,
            asset: "Dell Latitude",
            employee: "Rahul Sharma",
            dueDate: "10 Jul 2026",
        },

        

    ],

    activity: [

        {
            id: 1,
            title: "Dell Laptop allocated",
            user: "Rahul Sharma",
            time: "2 mins ago",
        },

        {
            id: 2,
            title: "Maintenance Approved",
            user: "Asset Manager",
            time: "10 mins ago",
        },

       
     

    ],

};

const allocationTrend = [

    { month: "Jan", value: 18 },
    { month: "Feb", value: 26 },
    
    { month: "Jun", value: 48 },

];

const maintenanceTrend = [

    { month: "Jan", value: 4 },
    { month: "Feb", value: 7 },
    { month: "Mar", value: 5 },
    { month: "Apr", value: 9 },
    { month: "May", value: 6 },
    { month: "Jun", value: 8 },

];

export default function DashboardPage() {

    // Later replace with API

    // const {data}=await getDashboard();

    const [dashboard] = useState(dashboardData);

    const cards = useMemo(() => [

        {

            title: "Total Assets",

            value: dashboard.kpis.totalAssets,

            icon: Boxes,

            color: "bg-blue-100 text-blue-700",

        },

        {

            title: "Available",

            value: dashboard.kpis.available,

            icon: Laptop,

            color: "bg-green-100 text-green-700",

        },

        {

            title: "Allocated",

            value: dashboard.kpis.allocated,

            icon: ArrowUpRight,

            color: "bg-indigo-100 text-indigo-700",

        },

        {

            title: "Maintenance",

            value: dashboard.kpis.maintenance,

            icon: Wrench,

            color: "bg-orange-100 text-orange-700",

        },

        {

            title: "Departments",

            value: dashboard.kpis.departments,

            icon: Building2,

            color: "bg-purple-100 text-purple-700",

        },

        {

            title: "Employees",

            value: dashboard.kpis.employees,

            icon: Users,

            color: "bg-pink-100 text-pink-700",

        },

    ], [dashboard]);
        return (
        <div className="space-y-6">

            {/* Header */}

            <div>

                <h1 className="text-3xl font-bold">
                    Dashboard
                </h1>

                <p className="mt-1 text-gray-500">
                    Welcome back! Here's a quick overview of your organization.
                </p>

            </div>

            {/* KPI Cards */}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

                {cards.map((card) => {

                    const Icon = card.icon;

                    return (

                        <div
                            key={card.title}
                            className="rounded-xl border bg-white p-6 shadow-sm"
                        >

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-gray-500">

                                        {card.title}

                                    </p>

                                    <h2 className="mt-2 text-3xl font-bold">

                                        {card.value}

                                    </h2>

                                </div>

                                <div
                                    className={`rounded-xl p-3 ${card.color}`}
                                >

                                    <Icon size={28} />

                                </div>

                            </div>

                        </div>

                    );

                })}

            </div>

            {/* Overdue Banner */}

            {dashboard.overdueCount > 0 && (

                <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-5">

                    <div className="flex items-center gap-3">

                        <AlertTriangle
                            className="text-red-600"
                            size={28}
                        />

                        <div>

                            <h3 className="font-semibold text-red-700">

                                {dashboard.overdueCount} Assets Overdue

                            </h3>

                            <p className="text-sm text-red-600">

                                These assets should be returned immediately.

                            </p>

                        </div>

                    </div>

                    <div className="mt-5 space-y-2">

                        {dashboard.overdue.map((item) => (

                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg bg-white p-3"
                            >

                                <div>

                                    <h4 className="font-medium">

                                        {item.asset}

                                    </h4>

                                    <p className="text-sm text-gray-500">

                                        {item.employee}

                                    </p>

                                </div>

                                <span className="text-sm font-medium text-red-600">

                                    Due: {item.dueDate}

                                </span>

                            </div>

                        ))}

                    </div>

                </div>

            )}

            {/* Charts */}

            <div className="grid gap-6 lg:grid-cols-2">

                {/* Allocation */}

                <div className="rounded-xl border bg-white p-6">

                    <h2 className="mb-6 text-xl font-semibold">

                        Allocation Trend

                    </h2>

                    <div className="space-y-4">

                        {allocationTrend.map((item) => (

                            <div
                                key={item.month}
                            >

                                <div className="mb-1 flex justify-between text-sm">

                                    <span>

                                        {item.month}

                                    </span>

                                    <span>

                                        {item.value}

                                    </span>

                                </div>

                                <div className="h-3 rounded-full bg-gray-200">

                                    <div
                                        className="h-3 rounded-full bg-blue-600"
                                        style={{
                                            width: `${item.value}%`,
                                        }}
                                    />

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

                {/* Maintenance */}

                <div className="rounded-xl border bg-white p-6">

                    <h2 className="mb-6 text-xl font-semibold">

                        Maintenance Trend

                    </h2>

                    <div className="space-y-4">

                        {maintenanceTrend.map((item) => (

                            <div
                                key={item.month}
                            >

                                <div className="mb-1 flex justify-between text-sm">

                                    <span>

                                        {item.month}

                                    </span>

                                    <span>

                                        {item.value}

                                    </span>

                                </div>

                                <div className="h-3 rounded-full bg-gray-200">

                                    <div
                                        className="h-3 rounded-full bg-orange-500"
                                        style={{
                                            width: `${item.value * 10}%`,
                                        }}
                                    />

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </div>

            {/* Recent Activity */}

            <div className="rounded-xl border bg-white">

                <div className="border-b p-5">

                    <div className="flex items-center gap-2">

                        <Activity size={22} />

                        <h2 className="text-xl font-semibold">

                            Recent Activity

                        </h2>

                    </div>

                </div>

                <div className="divide-y">

                    {dashboard.activity.map((activity) => (

                        <div
                            key={activity.id}
                            className="flex items-center justify-between p-5"
                        >

                            <div>

                                <h4 className="font-medium">

                                    {activity.title}

                                </h4>

                                <p className="text-sm text-gray-500">

                                    {activity.user}

                                </p>

                            </div>

                            <span className="text-sm text-gray-400">

                                {activity.time}

                            </span>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    );
}