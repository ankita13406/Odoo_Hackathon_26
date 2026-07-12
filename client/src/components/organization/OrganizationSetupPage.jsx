import { useEffect, useState } from "react";

import {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    deactivateDepartment,
} from "../api/department";

import {
    getCategories,
    createCategory,
    updateCategory,
} from "../api/category";

import {
    getEmployees,
    promoteEmployee,
} from "../api/employee";

import {
    DepartmentTable,
    DepartmentModal,
    CategoryTable,
    CategoryModal,
    EmployeeTable,
    PromoteRoleModal,
} from "../components/organization";

export default function OrganizationSetupPage() {

    const [activeTab, setActiveTab] = useState("departments");

    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [promoteModalOpen, setPromoteModalOpen] = useState(false);

    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    async function loadData() {
        setLoading(true);
        setError("");

        try {
            const [
                departmentRes,
                categoryRes,
                employeeRes,
            ] = await Promise.all([
                getDepartments(),
                getCategories(),
                getEmployees(),
            ]);

            setDepartments(departmentRes.data.data);
            setCategories(categoryRes.data.data);
            setEmployees(employeeRes.data.data);

        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Failed to load organization data."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleDepartmentSubmit(formData) {

        try {

            if (selectedDepartment) {

                await updateDepartment(
                    selectedDepartment.id,
                    formData
                );

            } else {

                await createDepartment(formData);

            }

            setDepartmentModalOpen(false);
            setSelectedDepartment(null);

            await loadData();

        } catch (err) {

            alert(
                err.response?.data?.error ||
                "Unable to save department."
            );

        }

    }

    async function handleDeleteDepartment(id) {

        if (!window.confirm("Delete this department?"))
            return;

        try {

            await deleteDepartment(id);

            await loadData();

        } catch {

            alert("Unable to delete department.");

        }

    }

    async function handleDeactivateDepartment(id) {

        try {

            await deactivateDepartment(id);

            await loadData();

        } catch {

            alert("Unable to deactivate department.");

        }

    }

    async function handleCategorySubmit(formData) {

        try {

            if (selectedCategory) {

                await updateCategory(
                    selectedCategory.id,
                    formData
                );

            } else {

                await createCategory(formData);

            }

            setCategoryModalOpen(false);
            setSelectedCategory(null);

            await loadData();

        } catch {

            alert("Unable to save category.");

        }

    }

    async function handlePromote(role) {

        try {

            await promoteEmployee(
                selectedEmployee.id,
                role
            );

            setPromoteModalOpen(false);
            setSelectedEmployee(null);

            await loadData();

        } catch {

            alert("Unable to promote employee.");

        }

    }

    function openDepartmentModal(department = null) {

        setSelectedDepartment(department);
        setDepartmentModalOpen(true);

    }

    function openCategoryModal(category = null) {

        setSelectedCategory(category);
        setCategoryModalOpen(true);

    }

    function openPromoteModal(employee) {

        setSelectedEmployee(employee);
        setPromoteModalOpen(true);

    }
        if (loading) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="text-lg font-medium text-gray-600">
                    Loading organization data...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Header */}

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-3xl font-bold">
                        Organization Setup
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Manage departments, categories and employees.
                    </p>

                </div>

                {activeTab === "departments" && (
                    <button
                        onClick={() => openDepartmentModal()}
                        className="rounded-lg bg-teal-600 px-5 py-2 text-white hover:bg-teal-700"
                    >
                        + Add Department
                    </button>
                )}

                {activeTab === "categories" && (
                    <button
                        onClick={() => openCategoryModal()}
                        className="rounded-lg bg-teal-600 px-5 py-2 text-white hover:bg-teal-700"
                    >
                        + Add Category
                    </button>
                )}

            </div>

            {/* Error */}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {/* Tabs */}

            <div className="flex gap-3 border-b">

                <button
                    onClick={() => setActiveTab("departments")}
                    className={`border-b-2 px-4 py-3 font-medium transition ${
                        activeTab === "departments"
                            ? "border-teal-600 text-teal-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Departments
                </button>

                <button
                    onClick={() => setActiveTab("categories")}
                    className={`border-b-2 px-4 py-3 font-medium transition ${
                        activeTab === "categories"
                            ? "border-teal-600 text-teal-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Categories
                </button>

                <button
                    onClick={() => setActiveTab("employees")}
                    className={`border-b-2 px-4 py-3 font-medium transition ${
                        activeTab === "employees"
                            ? "border-teal-600 text-teal-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Employees
                </button>

            </div>

            {/* Content */}

            {activeTab === "departments" && (

                <DepartmentTable
                    departments={departments}
                    onEdit={openDepartmentModal}
                    onDeactivate={handleDeactivateDepartment}
                    onDelete={handleDeleteDepartment}
                />

            )}

            {activeTab === "categories" && (

                <CategoryTable
                    categories={categories}
                    onEdit={openCategoryModal}
                />

            )}

            {activeTab === "employees" && (

                <EmployeeTable
                    employees={employees}
                    onPromote={openPromoteModal}
                />

            )}

            {/* Department Modal */}

            <DepartmentModal
                open={departmentModalOpen}
                onClose={() => {
                    setDepartmentModalOpen(false);
                    setSelectedDepartment(null);
                }}
                onSubmit={handleDepartmentSubmit}
                department={selectedDepartment}
                departments={departments}
                employees={employees}
            />

            {/* Category Modal */}

            <CategoryModal
                open={categoryModalOpen}
                onClose={() => {
                    setCategoryModalOpen(false);
                    setSelectedCategory(null);
                }}
                onSubmit={handleCategorySubmit}
                category={selectedCategory}
            />

            {/* Promote Employee */}

            <PromoteRoleModal
                open={promoteModalOpen}
                onClose={() => {
                    setPromoteModalOpen(false);
                    setSelectedEmployee(null);
                }}
                employee={selectedEmployee}
                onSubmit={handlePromote}
            />

        </div>
    );
}