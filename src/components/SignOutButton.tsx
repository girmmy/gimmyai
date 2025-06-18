import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import { toast } from "sonner";

export function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <button
      onClick={() => void handleSignOut()}
      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium text-sm"
    >
      Sign Out
    </button>
  );
}
