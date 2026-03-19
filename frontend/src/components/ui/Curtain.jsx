import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Curtain({ 
  children, 
  isOpen = false, 
  onOpenComplete,
  colors = {
    primary: "#c41e3a",    // Rich red
    secondary: "#dc143c",  // Crimson
    accent: "#8b0000"      // Dark red
  }
}) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShowContent(true);
        onOpenComplete?.();
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen, onOpenComplete]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Content Layer - Behind Curtains */}
      <div className={`transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        {children}
      </div>

      {/* Left Curtain - Slides from left to right */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: isOpen ? -100 : 0 }}
        transition={{ 
          duration: 1.2, 
          ease: [0.25, 0.1, 0.25, 1]
        }}
        className="fixed top-0 left-0 bottom-0 z-50 w-[30vw] max-w-[200px] min-w-[80px]"
        style={{ 
          background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 60%, ${colors.accent} 100%)`,
        }}
      >
        {/* Curtain folds/waves effect */}
        <div className="absolute inset-0 flex">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="flex-1 relative overflow-hidden"
              style={{
                transform: `skewX(-${3 + (i % 3)}deg)`,
              }}
            >
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, 
                    rgba(255,255,255,0.1) 0%, 
                    rgba(0,0,0,0.15) 50%, 
                    rgba(0,0,0,0.05) 100%)`,
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Vertical texture lines */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="absolute top-0 bottom-0 w-px bg-black/20"
              style={{ left: `${i * 7}%` }}
            />
          ))}
        </div>

        {/* Curtain tie-back decoration (left side) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
          <div 
            className="w-4 h-20 rounded-full"
            style={{
              background: `linear-gradient(180deg, ${colors.accent} 0%, ${colors.primary} 50%, ${colors.accent} 100%)`,
              boxShadow: '2px 0 8px rgba(0,0,0,0.3)'
            }}
          />
        </div>

        {/* Decorative top valance */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-8"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${colors.primary} 30%, ${colors.accent} 100%)`,
            borderTop: '2px solid rgba(255,255,255,0.2)'
          }}
        />
      </motion.div>

      {/* Right Curtain - Slides from right to left */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: isOpen ? 100 : 0 }}
        transition={{ 
          duration: 1.2, 
          ease: [0.25, 0.1, 0.25, 1]
        }}
        className="fixed top-0 right-0 bottom-0 z-50 w-[30vw] max-w-[200px] min-w-[80px]"
        style={{ 
          background: `linear-gradient(270deg, ${colors.primary} 0%, ${colors.secondary} 60%, ${colors.accent} 100%)`,
        }}
      >
        {/* Curtain folds/waves effect */}
        <div className="absolute inset-0 flex">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="flex-1 relative overflow-hidden"
              style={{
                transform: `skewX(${3 + (i % 3)}deg)`,
              }}
            >
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, 
                    rgba(255,255,255,0.1) 0%, 
                    rgba(0,0,0,0.15) 50%, 
                    rgba(0,0,0,0.05) 100%)`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Vertical texture lines */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="absolute top-0 bottom-0 w-px bg-black/20"
              style={{ left: `${i * 7}%` }}
            />
          ))}
        </div>

        {/* Curtain tie-back decoration (right side) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
          <div 
            className="w-4 h-20 rounded-full"
            style={{
              background: `linear-gradient(180deg, ${colors.accent} 0%, ${colors.primary} 50%, ${colors.accent} 100%)`,
              boxShadow: '-2px 0 8px rgba(0,0,0,0.3)'
            }}
          />
        </div>

        {/* Decorative top valance */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-8"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${colors.primary} 30%, ${colors.accent} 100%)`,
            borderTop: '2px solid rgba(255,255,255,0.2)'
          }}
        />
      </motion.div>

      {/* Top Valance - Little theater scallops */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isOpen ? -100 : 0 }}
        transition={{ 
          duration: 1, 
          ease: [0.25, 0.1, 0.25, 1]
        }}
        className="fixed top-0 left-0 right-0 z-50 h-16"
      >
        <div className="absolute inset-0" style={{
          background: `linear-gradient(180deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
        }} />
        {/* Scalloped edge */}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="flex-1 relative"
              style={{
                width: '5%',
              }}
            >
              <div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-6 rounded-b-full"
                style={{
                  background: `linear-gradient(180deg, ${colors.secondary} 0%, ${colors.accent} 100%)`,
                }}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
