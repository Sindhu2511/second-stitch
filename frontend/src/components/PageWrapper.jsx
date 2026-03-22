import { motion } from "framer-motion";

export default function PageWrapper({ children }) {
  return (
    // Added 'grain' class and improved transition
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen grain relative overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
