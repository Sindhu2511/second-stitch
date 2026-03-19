import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { X } from 'lucide-react';

const modalBackdrop = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalContainer = {
  hidden: { y: "-50px", opacity: 0 },
  visible: {
    y: "0",
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: { y: "50px", opacity: 0 }
};

export default function CreateProjectModal({ isOpen, onClose, onCreate }) {
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setError('Project name cannot be empty.');
      return;
    }
    onCreate(projectName);
    setProjectName('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 m-4 w-full max-w-md relative"
            variants={modalContainer}
            exit="exit"
            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
          >
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-rose-700 dark:text-white mb-6">
              Create a New Project
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="projectName" className="block text-sm font-medium text-rose-700 dark:text-white/80 mb-2">
                  Project Name
                </label>
                <Input
                  id="projectName"
                  type="text"
                  placeholder="e.g., Summer Wardrobe Revamp"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    setError('');
                  }}
                  className="w-full"
                  autoFocus
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <Button type="button" variant="secondary" onClick={onClose} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="bg-rose-600 hover:bg-rose-700 rounded-xl">
                  Create Project
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
