import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Plus, 
  Trophy, 
  Leaf, 
  Heart, 
  Share2,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from "lucide-react";
import Button from "./ui/Button";

const tutorialSteps = [
  {
    id: 1,
    title: "Welcome to Second Stitch!",
    description: "Your AI-powered sustainable fashion companion. Let's show you around!",
    icon: Sparkles,
    color: "from-rose-500 to-pink-500",
    features: [
      "Transform old clothes into new designs",
      "Track your sustainability impact",
      "Earn achievements and badges"
    ]
  },
  {
    id: 2,
    title: "Upload Your Items",
    description: "Start by uploading photos of clothes you want to redesign. Our AI will suggest beautiful upcycling ideas!",
    icon: Upload,
    color: "from-amber-500 to-orange-500",
    features: [
      "Take or upload a photo",
      "Get AI-powered redesign suggestions",
      "Compare before & after"
    ]
  },
  {
    id: 3,
    title: "Create Projects",
    description: "Organize your upcycling journey into collections. Keep your designs organized and track progress!",
    icon: Plus,
    color: "from-purple-500 to-violet-500",
    features: [
      "Create themed collections",
      "Group similar items together",
      "Track project progress"
    ]
  },
  {
    id: 4,
    title: "Earn Achievements",
    description: "Complete uploads, save designs, and share to earn badges. Level up your sustainability journey!",
    icon: Trophy,
    color: "from-amber-400 to-yellow-500",
    features: [
      "Unlock 8+ achievement badges",
      "Earn XP and level up",
      "Track your milestones"
    ]
  },
  {
    id: 5,
    title: "Track Your Impact",
    description: "See how much CO₂, water, and waste you've saved. Every upcycle makes a difference!",
    icon: Leaf,
    color: "from-emerald-500 to-green-500",
    features: [
      "View CO₂ emissions saved",
      "Track water saved",
      "See trees equivalent impact"
    ]
  },
  {
    id: 6,
    title: "Save & Share",
    description: "Love a design? Save it to your favorites and share your sustainable style with the world!",
    icon: Heart,
    color: "from-rose-400 to-red-400",
    features: [
      "Save favorite designs",
      "Share to social media",
      "Inspire others to upcycle"
    ]
  }
];

export default function OnboardingTutorial({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setDirection(1);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("onboarding_completed", "true");
    onComplete?.();
    onClose();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition z-10"
          >
            <X size={20} />
          </button>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 pt-6">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-8 bg-rose-500"
                    : index < currentStep
                    ? "w-2 bg-rose-300"
                    : "w-2 bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Icon */}
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="text-white" size={40} />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {step.description}
                </p>

                {/* Features list */}
                <div className="space-y-3 text-left bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                  {step.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between px-8 pb-8">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              Skip
            </button>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  <ChevronLeft size={20} className="text-gray-700 dark:text-gray-300" />
                </button>
              )}

              <button
                onClick={handleNext}
                className={`flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${step.color} text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105`}
              >
                {currentStep === tutorialSteps.length - 1 ? (
                  <>
                    Get Started
                    <Sparkles size={18} />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step counter */}
          <div className="text-center pb-4">
            <span className="text-xs text-gray-400">
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}