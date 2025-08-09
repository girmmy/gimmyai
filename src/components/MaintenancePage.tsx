import { useState, useEffect } from "react";

interface MaintenancePageProps {
  title?: string;
  message?: string;
  estimatedTime?: string;
  showProgress?: boolean;
}

export default function MaintenancePage({
  title = "GimmyAI is Getting Better!",
  message = "We're working hard to bring you amazing new features and improvements. Thank you for your patience!",
  estimatedTime = "We'll be back soon",
  showProgress = true,
}: MaintenancePageProps) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");

  // Animated progress bar (fake progress for visual appeal)
  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 20; // Reset to simulate ongoing work
        return prev + Math.random() * 3;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [showProgress]);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <style>
        {`
          .animation-delay-300 {
            animation-delay: 300ms;
          }
        `}
      </style>
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo with maintenance indicators */}
        <div className="flex justify-center items-center mb-8 space-x-4">
          <div className="text-4xl animate-bounce">🔨</div>
          <img
            src="/logo/gimmyai-transparentbg.png"
            alt="GimmyAI Logo"
            className="w-20 h-24 animate-pulse"
          />
          <div className="text-4xl animate-bounce animation-delay-300">⚠️</div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white">🚧 {title} 🚧</h1>

          <p className="text-lg text-slate-300 leading-relaxed">{message}</p>

          {/* Progress Bar */}
          {showProgress && (
            <div className="space-y-4">
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-slate-400">
                Working on improvements{dots}
              </p>
            </div>
          )}

          {/* Estimated Time */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-blue-400 font-medium">{estimatedTime}</p>
          </div>

          {/* Features Preview */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">What's Coming:</h3>
            <div className="grid gap-2">
              {[
                "🚀 Faster response times",
                "✨ Enhanced AI capabilities",
                "🎨 Improved user interface",
                "📱 Better mobile experience",
                "🔧 Performance optimizations",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="text-left text-slate-300 bg-slate-800/30 rounded-lg p-3 border border-slate-700/50"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-sm text-slate-400 space-y-2">
            <p>Need help? Have questions?</p>
            <p>
              Contact us at{" "}
              <a
                href="mailto:gimmys943@gmail.com"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                gimmys943@gmail.com
              </a>
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Check Again
        </button>
      </div>
    </div>
  );
}
