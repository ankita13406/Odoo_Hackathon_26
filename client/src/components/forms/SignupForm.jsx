import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, User, Shield } from "lucide-react";
import { useForm } from "react-hook-form";

import PasswordInput from "../common/PasswordInput";
import { signupUser } from "../../api/auth";

export default function SignupForm() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const password = watch("password", "");

    const getStrength = () => {
        if (!password) return "";

        let score = 0;

        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 1) return "Weak";
        if (score <= 3) return "Medium";

        return "Strong";
    };

    const strength = getStrength();

    const onSubmit = async (formData) => {
        setLoading(true);
        setServerError("");

        try {
            await signupUser(
                formData.name,
                formData.email,
                formData.password
            );

            navigate("/login", {
                state: {
                    success:
                        "Account created successfully. Please login.",
                },
            });
        } catch (error) {
            setServerError(
                error.response?.data?.error ||
                    "Unable to create account."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
        >
            {serverError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {serverError}
                </div>
            )}

            {/* Name */}

            <div>
                <label className="mb-2 block text-sm font-medium">
                    Full Name
                </label>

                <div className="relative">

                    <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        placeholder="Enter your full name"
                        className={`w-full rounded-lg border py-3 pl-10 pr-4 focus:ring-2 outline-none
                        ${
                            errors.name
                                ? "border-red-500"
                                : "border-gray-300 focus:border-teal-500 focus:ring-teal-200"
                        }`}
                        {...register("name", {
                            required: "Full name is required",
                            minLength: {
                                value: 3,
                                message:
                                    "Minimum 3 characters required",
                            },
                        })}
                    />

                </div>

                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                    </p>
                )}
            </div>

            {/* Email */}

            <div>

                <label className="mb-2 block text-sm font-medium">
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
                        className={`w-full rounded-lg border py-3 pl-10 pr-4 focus:ring-2 outline-none
                        ${
                            errors.email
                                ? "border-red-500"
                                : "border-gray-300 focus:border-teal-500 focus:ring-teal-200"
                        }`}
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value:
                                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Invalid email",
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
                    minLength: {
                        value: 8,
                        message:
                            "Password must be at least 8 characters",
                    },
                }}
            />

            {password && (
                <p
                    className={`text-sm font-medium ${
                        strength === "Strong"
                            ? "text-green-600"
                            : strength === "Medium"
                            ? "text-yellow-600"
                            : "text-red-600"
                    }`}
                >
                    Password Strength : {strength}
                </p>
            )}

            {/* Confirm Password */}

            <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                register={register}
                error={errors.confirmPassword}
                disabled={loading}
                validation={{
                    required:
                        "Please confirm your password",
                    validate: (value) =>
                        value === password ||
                        "Passwords do not match",
                }}
            />

            {/* Role */}

            <div className="rounded-lg border bg-gray-50 p-3 flex items-center gap-3">

                <Shield
                    size={20}
                    className="text-teal-600"
                />

                <div>

                    <p className="font-medium">
                        Role
                    </p>

                    <p className="text-sm text-gray-600">
                        Employee (Assigned automatically)
                    </p>

                </div>

            </div>

            {/* Button */}

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:bg-gray-400"
            >
                {loading
                    ? "Creating Account..."
                    : "Create Account"}
            </button>

            {/* Login */}

            <p className="text-center text-sm text-gray-600">

                Already have an account?

                <Link
                    to="/login"
                    className="ml-1 font-semibold text-teal-600 hover:text-teal-700"
                >
                    Login
                </Link>

            </p>
        </form>
    );
}