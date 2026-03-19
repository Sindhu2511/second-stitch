import React from 'react';
import Card from '../../components/ui/Card';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function Project({ project }) {
  // Determine if the project is "Uncategorized" to give it a different style or description
  const isUncategorized = !project.id;

  return (
    <motion.div variants={itemVariants} className="mb-12">
      <h2 className="text-2xl font-bold text-rose-700 dark:text-white mb-4">
        {project.name}
      </h2>
      
      {isUncategorized && (
        <p className="text-rose-600 dark:text-white/60 mb-6 -mt-2">
          These are items that haven't been assigned to a project yet.
        </p>
      )}

      {project.uploads && project.uploads.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {project.uploads.map((upload) => (
            <motion.div key={upload.id} variants={itemVariants}>
              <Card className="overflow-hidden group cursor-pointer bg-white/60 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20">
                <div className="aspect-w-1 aspect-h-1">
                  <img 
                    src={upload.image_url || 'https://placehold.co/400'} 
                    alt="Uploaded garment" 
                    className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-rose-700 dark:text-white truncate">
                    {upload.name || 'Untitled Upload'}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-10 px-6 bg-white/50 dark:bg-gray-800/70 rounded-2xl">
          <p className="text-rose-700 dark:text-white/70">
            No uploads in this project yet.
          </p>
        </div>
      )}
    </motion.div>
  );
}
