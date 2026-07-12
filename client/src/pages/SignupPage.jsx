import AuthLayout from "../components/common/AuthLayout";
import SignupForm from "../components/forms/SignupForm";

export default function SignupPage() {
    return (
        <AuthLayout
            title="Create Employee Account"
            subtitle="Register to access AssetFlow ERP"
        >
            <SignupForm />
        </AuthLayout>
    );
}