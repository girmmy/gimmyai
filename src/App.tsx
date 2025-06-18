import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import ChatInterface from "./components/ChatInterface";
import SignInForm from "./components/SignInForm";
import SignUpForm from "./components/SignUpForm";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import LandingPage from "./components/LandingPage";
import NotFound from "./components/NotFound";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/signin" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-900 text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignInForm />} />
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <ChatInterface />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
