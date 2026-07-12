import AuthLayout from "../components/common/AuthLayout";
import LoginForm from "../components/forms/LoginForm";

export default function LoginPage() {
    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to continue to AssetFlow ERP"
        >
            <LoginForm />
        </AuthLayout>
    );
}