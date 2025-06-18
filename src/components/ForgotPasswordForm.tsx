import { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "sonner";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
      setIsEmailSent(true);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">
            Reset Password
          </h1>
          <p className="text-slate-300">
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </div>

        {isEmailSent ? (
          <div className="text-center space-y-4">
            <p className="text-slate-300">
              Check your email for a link to reset your password. If it doesn't
              appear within a few minutes, check your spam folder.
            </p>
            <Link
              to="/signin"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="text-center text-slate-400">
              Remember your password?{" "}
              <Link to="/signin" className="text-blue-400 hover:text-blue-300">
                Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
