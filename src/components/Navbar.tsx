import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar({
  onSidebarToggle,
}: {
  onSidebarToggle?: () => void;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Sidebar toggle button for mobile, only if onSidebarToggle is provided */}
            {onSidebarToggle && (
              <button
                className="md:hidden mr-2 p-2 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={onSidebarToggle}
                aria-label="Open sidebar"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 bg-clip-text text-transparent bg-size-200 animate-gradient"
            >
              GimmyAI
            </Link>
          </div>
          {/* Responsive auth buttons */}
          <div className="flex items-center space-x-4">
            {/* Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-slate-300">{user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
            {/* Mobile dropdown */}
            <div className="md:hidden relative">
              <details className="group">
                <summary className="list-none cursor-pointer flex items-center px-2 py-1 rounded-lg hover:bg-slate-800 focus:outline-none">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                </summary>
                <div className="absolute right-0 mt-2 w-40 bg-slate-800 rounded-lg shadow-lg z-20 py-2 border border-slate-700">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-slate-300 truncate">
                        {user.email}
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/signin"
                        className="block px-4 py-2 text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        className="block px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/20 mt-2"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
