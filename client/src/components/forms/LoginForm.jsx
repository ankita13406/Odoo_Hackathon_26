import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";

import PasswordInput from "../common/PasswordInput";
import useAuth from "../../hooks/useAuth";

export default function LoginForm() {
    const navigate = useNavigate();

    const { login, loading } = useAuth();

    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (formData) => {
        setServerError("");

        const result = await login(
            formData.email,
            formData.password
        );

        if (result.success) {
            navigate("/dashboard");
        } else {
            setServerError(result.message);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
        >
            {serverError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {serverError}
                </div>
            )}

            {/* Email */}

            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                </label>

                <div className="relative">
                    <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="email"
                        placeholder="Enter your email"
                        className={`w-full rounded-lg border py-3 pl-10 pr-4 outline-none transition-all
                        ${
                            errors.email
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:border-teal-500 focus:ring-teal-200"
                        }
                        focus:ring-2`}
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value:
                                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Invalid email address",
                            },
                        })}
                    />
                </div>

                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                    </p>
                )}
            </div>

            {/* Password */}

            <PasswordInput
                label="Password"
                name="password"
                register={register}
                error={errors.password}
                disabled={loading}
                validation={{
                    required: "Password is required",
                }}
            />

            {/* Remember Me */}

            <div className="flex items-center justify-between">

                <label className="flex items-center gap-2 text-sm text-gray-600">

                    <input
                        type="checkbox"
                        className="rounded"
                    />

                    Remember Me

                </label>

                <button
                    type="button"
                    className="text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                    Forgot Password?
                </button>

            </div>

            {/* Login Button */}

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
                {loading ? "Signing In..." : "Sign In"}
            </button>

            {/* Divider */}

            <div className="relative">

                <div className="absolute inset-0 flex items-center">

                    <div className="w-full border-t" />

                </div>

                <div className="relative flex justify-center">

                    <span className="bg-white px-3 text-sm text-gray-500">
                        OR
                    </span>

                </div>

            </div>

            {/* Signup */}

            <p className="text-center text-sm text-gray-600">

                Don't have an account?

                <Link
                    to="/signup"
                    className="ml-1 font-semibold text-teal-600 hover:text-teal-700"
                >
                    Create Account
                </Link>

            </p>

            {/* Demo Credentials */}

            <div className="rounded-lg border bg-gray-50 p-4">

                <h4 className="mb-2 font-semibold">
                    Demo Admin
                </h4>

                <p className="text-sm">
                    Email:
                    <br />
                    admin@assetflow.com
                </p>

                <p className="mt-2 text-sm">
                    Password:
                    <br />
                    Admin@123
                </p>

            </div>
        </form>
    );
}