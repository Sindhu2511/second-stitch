import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Leaf, Droplets, Wind, Trees } from "lucide-react";

function Counter({ value, suffix = "", prefix = "", duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const durationMs = duration * 1000;
    const increment = end / (durationMs / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const metrics = [
  {
    id: "co2",
    label: "CO₂ Emissions Saved",
    value: 12.5,
    unit: "kg",
    icon: Wind,
    color: "from-slate-400 to-gray-500",
    bgColor: "bg-slate-100",
    description: "Equivalent to driving 45 miles",
  },
  {
    id: "water",
    label: "Water Saved",
    value: 2500,
    unit: "L",
    icon: Droplets,
    color: "from-blue-400 to-cyan-500",
    bgColor: "bg-blue-50",
    description: "Enough for 30 showers",
  },
  {
    id: "items",
    label: "Items Upcycled",
    value: 8,
    unit: "",
    icon: Leaf,
    color: "from-emerald-400 to-green-500",
    bgColor: "bg-emerald-50",
    description: "Garments given new life",
  },
  {
    id: "trees",
    label: "Trees Equivalent",
    value: 0.5,
    unit: "",
    icon: Trees,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    description: "Carbon offset equivalent",
  },
];

export default function SustainabilityImpact({ totalUploads = 0 }) {
  // Calculate personalized metrics based on uploads
  const multiplier = Math.max(1, totalUploads);
  
  const personalizedMetrics = metrics.map((metric) => ({
    ...metric,
    value: metric.id === "items" ? totalUploads : metric.value * multiplier,
  }));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {personalizedMetrics.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative overflow-hidden rounded-2xl ${metric.bgColor} border border-white/50 shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            {/* Gradient accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${metric.color}`} />
            
            <div className="p-5">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-3 shadow-md`}>
                <Icon className="text-white" size={20} />
              </div>
              
              {/* Value */}
              <div className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-1">
                {metric.id === "co2" || metric.id === "trees" ? (
                  <Counter value={metric.value} suffix={metric.unit} prefix="" />
                ) : (
                  <Counter value={metric.value} suffix={metric.unit} />
                )}
              </div>
              
              {/* Label */}
              <p className="text-sm font-semibold text-gray-600 mb-1">
                {metric.label}
              </p>
              
              {/* Description */}
              <p className="text-xs text-gray-500">
                {metric.description}
              </p>
            </div>
            
            {/* Decorative circle */}
            <div className={`absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br ${metric.color} opacity-10 rounded-full`} />
          </motion.div>
        );
      })}
    </div>
  );
}
