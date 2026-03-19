export const btnVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    y: -2,
    boxShadow: "0 20px 30px rgba(162,125,88,0.2)",
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 10 
    }
  },
  tap: { 
    scale: 0.94,
    transition: { stiffness: 1000, damping: 10 }
  }
};

export const inputVariants = {
  hover: { scale: 1.01 },
  focus: {
    scale: 1.01,
    boxShadow: "0 10px 22px rgba(162,125,88,0.08)",
    transition: { duration: 0.18 },
  },
};

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.36, ease: "easeOut" } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.28 } },
};
