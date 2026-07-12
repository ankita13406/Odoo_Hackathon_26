import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function PasswordInput({
    label = "Password",
    name,
    register,
    validation = {},
    error,
    placeholder = "Enter your password",
    disabled = false,
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-2">
            <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-700"
            >
                {label}
            </label>

            <div className="relative">
                {/* Lock Icon */}
                <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                {/* Input */}
                <input
                    id={name}
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder}
                    disabled={disabled}
                    {...register(name, validation)}
                    className={`w-full rounded-lg border py-3 pl-10 pr-12 text-sm
                        outline-none transition-all
                        ${
                            error
                                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                                : "border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                        }
                        ${
                            disabled
                                ? "cursor-not-allowed bg-gray-100"
                                : "bg-white"
                        }`}
                />

                {/* Eye Button */}
                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                    {showPassword ? (
                        <EyeOff size={18} />
                    ) : (
                        <Eye size={18} />
                    )}
                </button>
            </div>

            {/* Error */}
            {error && (
                <p className="text-sm text-red-600">
                    {error.message}
                </p>
            )}
        </div>
    );
}