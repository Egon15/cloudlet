import SignUpForm from "@/components/SignUpForm";
import Navbar from "@/components/Navbar";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Top navigation bar */}
      <Navbar />

      {/* Centered sign-up form */}
      <main className="flex-1 flex justify-center items-center p-6">
        <SignUpForm />
      </main>

      {/* Footer with branding and dark mode support */}
      <footer className="bg-gray-900 text-white py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Cloudlet. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
