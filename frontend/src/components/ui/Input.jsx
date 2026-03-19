import React from 'react';
import { motion } from 'framer-motion';
import { inputVariants } from '../../utils/motionVariants';

export default function Input({ className = '', ...props }) {
  return (
    <motion.input
      {...props}
      variants={inputVariants}
      whileHover="hover"
      whileFocus="focus"
      className={`input ${className}`}
    />
  );
}
