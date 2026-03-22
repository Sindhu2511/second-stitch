import { useEffect, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { Trash2, Scan, Sparkles, Scissors } from "lucide-react";

export const CountUpTicker = ({ value, label, icon }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const springValue = useSpring(0, {
    stiffness: 100,
    damping: 30,
  });

  const displayValue = useTransform(springValue, (latest) => 
    Math.floor(latest).toLocaleString()
  );

  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, value, springValue]);

  return (
    <div ref={ref} className="feature-card bg-white border-2 border-amber-100 flex flex-col items-center justify-center py-10 shadow-xl">
      <div className="text-5xl mb-4">{icon}</div>
      <div className="flex items-baseline gap-1">
        <motion.span className="text-6xl font-black text-[#2C2621]">{displayValue}</motion.span>
        <span className="text-4xl font-black text-[#2C2621]">+</span>
      </div>
      <p className="text-[#2C2621]/60 font-bold uppercase tracking-widest text-[10px] mt-2">
        {label}
      </p>
    </div>
  );
};

export const CircularJourney = () => {
  const steps = [
    { 
      title: "Discarded", 
      desc: "Garments destined for landfills.", 
      icon: Trash2,
      color: "bg-amber-100"
    },
    { 
      title: "AI Scanned", 
      desc: "Neural analysis of structure.", 
      icon: Scan,
      color: "bg-blue-100"
    },
    { 
      title: "Redesigned", 
      desc: "A sustainable blueprint.", 
      icon: Sparkles,
      color: "bg-purple-100"
    },
    { 
      title: "Re-stitched", 
      desc: "New life for your wardrobe.", 
      icon: Scissors,
      color: "bg-emerald-100"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-16 text-center text-amber-950">The Circular Journey</h2>
      
      <div className="relative">
        {/* Connection line */}
        <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 hidden md:block" />
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center flex-1 group"
              >
                {/* Icon Circle */}
                <div className={`
                  w-32 h-32 rounded-full bg-white shadow-xl border-4 border-white
                  flex items-center justify-center mb-6
                  transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl
                  ${step.color}
                `}>
                  <Icon className="w-12 h-12 text-amber-900" strokeWidth={1.5} />
                </div>
                
                {/* Step Number */}
                <span className="absolute -top-2 left-1/2 -translate-x-16 w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                
                <h4 className="font-bold text-lg text-amber-950 mb-2">{step.title}</h4>
                <p className="text-sm text-amber-950/60 max-w-[160px] leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Animated arrow indicators for desktop */}
      <div className="hidden md:flex justify-center mt-12 gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3], x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          >
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
