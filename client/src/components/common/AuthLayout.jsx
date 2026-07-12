import { ShieldCheck, Boxes, BarChart3 } from "lucide-react";

export default function AuthLayout({
    title,
    subtitle,
    children,
}) {
    return (
        <div className="min-h-screen bg-slate-100 flex">

            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-teal-700 via-teal-600 to-cyan-600 text-white p-16 flex-col justify-between">

                <div>

                    <h1 className="text-5xl font-bold">
                        AssetFlow
                    </h1>

                    <p className="mt-4 text-xl text-teal-100">
                        Enterprise Asset & Resource Management System
                    </p>

                </div>

                <div className="space-y-8">

                    <div className="flex items-start gap-4">
                        <ShieldCheck size={34} />
                        <div>
                            <h3 className="font-semibold text-lg">
                                Secure Asset Tracking
                            </h3>
                            <p className="text-teal-100">
                                Monitor every organizational asset from
                                acquisition to retirement.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <Boxes size={34} />
                        <div>
                            <h3 className="font-semibold text-lg">
                                Resource Allocation
                            </h3>
                            <p className="text-teal-100">
                                Allocate laptops, meeting rooms, vehicles,
                                and equipment efficiently.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <BarChart3 size={34} />
                        <div>
                            <h3 className="font-semibold text-lg">
                                Enterprise Analytics
                            </h3>
                            <p className="text-teal-100">
                                Gain insights with reports, maintenance
                                history, and audit trails.
                            </p>
                        </div>
                    </div>

                </div>

                <p className="text-sm text-teal-200">
                    © 2026 AssetFlow ERP
                </p>

            </div>

            {/* Right Panel */}

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">

                <div className="w-full max-w-md">

                    <div className="mb-8">

                        <h2 className="text-3xl font-bold text-gray-900">
                            {title}
                        </h2>

                        <p className="mt-2 text-gray-600">
                            {subtitle}
                        </p>

                    </div>

                    {children}

                </div>

            </div>

        </div>
    );
}