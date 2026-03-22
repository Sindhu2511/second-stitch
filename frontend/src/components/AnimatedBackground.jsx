import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ x: [0, 100, -50, 0], y: [0, -80, 40, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px]
          bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-300
          opacity-30 blur-[120px] rounded-full"
      />

      <motion.div
        animate={{ x: [0, -120, 60, 0], y: [0, 60, -40, 0] }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px]
          bg-gradient-to-br from-orange-200 via-rose-300 to-fuchsia-300
          opacity-30 blur-[140px] rounded-full"
      />
    </div>
  );
}
