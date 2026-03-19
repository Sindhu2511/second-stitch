import React from 'react';
import { motion } from 'framer-motion';
import { btnVariants } from '../../utils/motionVariants';

export default function Button({ children, className = '', ...props }) {
  return (
    <motion.button
      {...props}
      variants={btnVariants}
      whileHover="hover"
      whileTap="tap"
      className={`btn ${className}`}
    >
      {children}
    </motion.button>
  );
}
