import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { 
  Trophy, 
  Leaf, 
  Zap, 
  Star, 
  Award, 
  Target,
  Flame,
  Heart,
  Share2,
  TrendingUp
} from "lucide-react";

// Achievement definitions
export const achievements = [
  {
    id: "first_upcycle",
    title: "First Step",
    description: "Complete your first upcycle",
    icon: Star,
    requirement: 1,
    type: "upcycles",
    color: "from-yellow-400 to-amber-500",
    bgColor: "bg-yellow-50"
  },
  {
    id: "eco_warrior",
    title: "Eco Warrior",
    description: "Save 10kg of CO2 emissions",
    icon: Leaf,
    requirement: 10,
    type: "co2",
    unit: "kg",
    color: "from-green-400 to-emerald-500",
    bgColor: "bg-green-50"
  },
  {
    id: "water_saver",
    title: "Water Saver",
    description: "Save 1000 liters of water",
    icon: Zap,
    requirement: 1000,
    type: "water",
    unit: "L",
    color: "from-blue-400 to-cyan-500",
    bgColor: "bg-blue-50"
  },
  {
    id: "trendsetter",
    title: "Trendsetter",
    description: "Share 5 designs publicly",
    icon: Share2,
    requirement: 5,
    type: "shares",
    color: "from-pink-400 to-rose-500",
    bgColor: "bg-pink-50"
  },
  {
    id: "collector",
    title: "Collector",
    description: "Upload 10 clothing items",
    icon: Target,
    requirement: 10,
    type: "uploads",
    color: "from-purple-400 to-violet-500",
    bgColor: "bg-purple-50"
  },
  {
    id: "on_fire",
    title: "On Fire",
    description: "Upload 3 items in one week",
    icon: Flame,
    requirement: 3,
    type: "weekly",
    color: "from-orange-400 to-red-500",
    bgColor: "bg-orange-50"
  },
  {
    id: "community_love",
    title: "Community Love",
    description: "Receive 10 likes on your designs",
    icon: Heart,
    requirement: 10,
    type: "likes",
    color: "from-red-400 to-pink-500",
    bgColor: "bg-red-50"
  },
  {
    id: "master_creator",
    title: "Master Creator",
    description: "Complete 25 upcycles",
    icon: Award,
    requirement: 25,
    type: "upcycles",
    color: "from-amber-400 to-yellow-600",
    bgColor: "bg-amber-50"
  }
];

// Calculate user progress
export function calculateProgress(stats) {
  const {
    totalUpcycles = 0,
    co2Saved = 0,
    waterSaved = 0,
    sharesCount = 0,
    uploadsCount = 0,
    likesCount = 0,
    weeklyUploads = 0
  } = stats;

  return achievements.map(achievement => {
    let current = 0;
    let progress = 0;

    switch (achievement.type) {
      case "upcycles":
        current = totalUpcycles;
        break;
      case "co2":
        current = co2Saved;
        break;
      case "water":
        current = waterSaved;
        break;
      case "shares":
        current = sharesCount;
        break;
      case "uploads":
        current = uploadsCount;
        break;
      case "likes":
        current = likesCount;
        break;
      case "weekly":
        current = weeklyUploads;
        break;
      default:
        current = 0;
    }

    progress = Math.min(100, (current / achievement.requirement) * 100);
    const unlocked = current >= achievement.requirement;

    return {
      ...achievement,
      current,
      progress,
      unlocked
    };
  });
}

// Badge display component
export default function Achievements({ stats = {}, compact = false }) {
  const progressData = calculateProgress(stats);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const unlockedCount = progressData.filter(a => a.unlocked).length;
  const totalCount = progressData.length;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {progressData.slice(0, 3).map((achievement, i) => {
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.id}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 border-white
                  ${achievement.unlocked 
                    ? `bg-gradient-to-br ${achievement.color}` 
                    : 'bg-gray-200'}
                `}
              >
                <Icon className={`w-4 h-4 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`} />
              </div>
            );
          })}
        </div>
        <span className="text-sm font-medium text-rose-700">
          {unlockedCount}/{totalCount} badges
        </span>
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-rose-800">Achievements</h3>
            <p className="text-sm text-rose-600">{unlockedCount} of {totalCount} unlocked</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-rose-700">{Math.round((unlockedCount / totalCount) * 100)}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-rose-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isInView ? `${(unlockedCount / totalCount) * 100}%` : 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
        />
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {progressData.map((achievement, index) => {
          const Icon = achievement.icon;
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1 }}
              className={`
                relative p-4 rounded-2xl text-center transition-all duration-300
                ${achievement.unlocked 
                  ? `${achievement.bgColor} shadow-lg hover:shadow-xl hover:scale-105` 
                  : 'bg-gray-50 opacity-60'}
              `}
            >
              {/* Badge Circle */}
              <div className={`
                w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3
                ${achievement.unlocked 
                  ? `bg-gradient-to-br ${achievement.color} shadow-md` 
                  : 'bg-gray-200'}
              `}>
                <Icon className={`w-8 h-8 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`} />
              </div>
              
              {/* Locked overlay */}
              {!achievement.unlocked && (
                <div className="absolute top-2 right-2">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Title & Progress */}
              <h4 className={`font-bold text-sm mb-1 ${achievement.unlocked ? 'text-rose-800' : 'text-gray-500'}`}>
                {achievement.title}
              </h4>
              <p className="text-xs text-rose-600 mb-2">{achievement.description}</p>
              
              {/* Progress indicator */}
              <div className="mt-2">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${achievement.unlocked ? 'bg-green-500' : 'bg-rose-400'}`}
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  {achievement.current} / {achievement.requirement}
                  {achievement.unit ? ` ${achievement.unit}` : ''}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// XP & Level System
export function LevelSystem({ stats = {} }) {
  const totalUpcycles = stats.totalUpcycles || 0;
  const totalXp = totalUpcycles * 100 + (stats.co2Saved || 0) * 10 + (stats.sharesCount || 0) * 50;
  const level = Math.floor(totalXp / 500) + 1;
  const currentLevelXp = totalXp % 500;
  const progressToNextLevel = (currentLevelXp / 500) * 100;

  const levelTitles = [
    "Beginner", "Creator", "Designer", "Artist", "Master", "Legend"
  ];
  const title = levelTitles[Math.min(levelTitles.length - 1, Math.floor((level - 1) / 3))];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
          <span className="text-2xl font-black text-white">{level}</span>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-rose-800">{title}</h4>
          <p className="text-sm text-rose-600">Level {level}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-amber-600">{totalXp} XP</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-rose-700">
          <span>Progress to Level {level + 1}</span>
          <span>{currentLevelXp}/500 XP</span>
        </div>
        <div className="h-3 bg-rose-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressToNextLevel}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
