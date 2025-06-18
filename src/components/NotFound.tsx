import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8 bg-slate-900">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="mb-8">
            <img
              src="/logo/gimmyai-transparentbg.png"
              alt="GimmyAI Logo"
              className="h-24 w-auto mx-auto"
            />
          </div>

          {/* 404 Text */}
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-9xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 bg-clip-text text-transparent bg-size-200 animate-gradient mb-4"
          >
            404
          </motion.h1>

          {/* Message */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-semibold text-white mb-4"
          >
            Oops! Page Not Found
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-slate-300 mb-8 text-lg"
          >
            The page you're looking for seems to have vanished into the digital
            void. Don't worry though, our AI is here to help you find your way
            back!
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-medium shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105"
            >
              Return Home
            </Link>
            <Link
              to="/chat"
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105"
            >
              Start Chatting
            </Link>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 flex justify-center space-x-4 text-4xl"
          >
            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
              🤖
            </span>
            <span
              className="animate-bounce"
              style={{ animationDelay: "150ms" }}
            >
              📚
            </span>
            <span
              className="animate-bounce"
              style={{ animationDelay: "300ms" }}
            >
              💡
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
