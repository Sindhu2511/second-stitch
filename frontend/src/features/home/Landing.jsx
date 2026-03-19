import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import { CountUpTicker, CircularJourney } from "../../components/SustainabilityElements";
import { useRef } from "react";
import { Leaf, Recycle, Sparkles, Scan } from "lucide-react";

// Header Component with restored size
const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-amber-100/50">
      <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
        {/* Restored Logo Size */}
        <div 
          className="text-2xl font-black tracking-tighter text-amber-950 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => navigate('/')}
        >
          SECOND STITCH
        </div>

        {/* Scaled Navigation Links */}
        <div className="hidden md:flex items-center gap-10">
          <span className="text-base font-bold text-amber-900/70 hover:text-amber-950 transition-colors cursor-pointer">Features</span>
          <span className="text-base font-bold text-amber-900/70 hover:text-amber-950 transition-colors cursor-pointer">Sustainability</span>
          <span className="text-base font-bold text-amber-900/70 hover:text-amber-950 transition-colors cursor-pointer">Inspiration</span>
          
          {/* Polished Sign In Button */}
          <button 
            onClick={() => navigate("/login")}
            className="bg-[#2C2621] text-[#FDFBF7] px-8 py-3 rounded-full text-base font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
          >
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
};

// Moving Kinetic Logo (Retained from your core structure)
const KineticLogo = () => {
  const word = "SECOND STITCH";
  return (
    <motion.div 
      initial="hidden" animate="visible"
      className="flex flex-wrap justify-center text-6xl md:text-9xl font-black tracking-tighter text-amber-950"
    >
      {word.split("").map((letter, i) => (
        <motion.span 
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { delay: i * 0.05, type: "spring" }}
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  
  // 2. Create the reference point
  const journeyRef = useRef(null); 

  // 3. The scroll function
  const scrollToJourney = () => {
    if (journeyRef.current) {
      journeyRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" // Ensures the section aligns to the top of the screen
      });
    }
  };
  // Expanded set of 12 unique sustainable fashion images
  const carouselImages = [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&fit=crop",
    "https://images.unsplash.com/photo-1539109132314-d49c02d722c5?w=500&fit=crop",
    "https://images.unsplash.com/photo-1537832816519-689ad163238b?w=500&fit=crop",
    "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=500&fit=crop",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&fit=crop",
    "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=500&fit=crop",
    "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&fit=crop",
    "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=500&fit=crop"
  ];

  return (
    <PageWrapper>
      <Navbar />
      
{/* SECTION 1: HERO */}
<section className="min-h-screen flex flex-col items-center justify-center pt-32 px-6">
  {/* Retaining your core Kinetic Logo animation */}
  <KineticLogo />
  
  <motion.p 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    transition={{ delay: 1 }}
    className="text-xl md:text-2xl text-amber-950/70 mt-8 max-w-2xl text-center font-medium leading-relaxed"
  >
    Your wardrobe is full of potential. Our AI reimagines your old garments into modern, sustainable pieces.
  </motion.p>
  
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ delay: 1.2 }}
    className="flex flex-col sm:flex-row gap-4 mt-12"
  >
    <button 
      onClick={() => navigate("/upload")}
      className="bg-[#E67E22] text-[#FDFBF7] px-10 py-5 rounded-full text-lg font-bold shadow-xl hover:brightness-110 hover:scale-105 transition-all active:scale-95"
    >
      Start Upcycling
    </button>
    
    <button 
      onClick={scrollToJourney}
      className="bg-white border-2 border-amber-950/10 text-amber-950 px-10 py-5 rounded-full text-lg font-bold hover:bg-amber-50 transition-all hover:scale-105 active:scale-95"
    >
      How it works
    </button>
  </motion.div>
</section>

{/* SECTION 2: UPDATED FULL-WIDTH MARQUEE */}
      <section className="py-20 bg-amber-50/50 overflow-hidden">
        <div className="mb-12 px-6 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-amber-950">Community Inspirations</h2>
        </div>
        
        <div className="relative flex">
          <motion.div 
            animate={{ x: [0, -2000] }} // Increased distance for more images
            transition={{ 
              duration: 40, // Slower speed for better viewing
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="flex gap-6 whitespace-nowrap px-6"
          >
            {/* Render the array twice for a seamless infinite loop */}
            {[...carouselImages, ...carouselImages].map((src, i) => (
              <div 
                key={i} 
                className="inline-block w-80 h-[450px] bg-white rounded-[2.5rem] overflow-hidden shadow-lg flex-shrink-0 border border-white transition-transform hover:scale-[1.02]"
              >
                <img 
                  src={src} 
                  className="w-full h-full object-cover" 
                  alt={`Upcycled inspiration ${i}`} 
                  loading="lazy"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

{/* SECTION 3: FEATURES & IMPACT */}
<section className="py-16 px-6 max-w-7xl mx-auto">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-16">
    <div className="feature-card h-full flex flex-col justify-center">
      <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
        <Recycle className="w-7 h-7 text-emerald-600" />
      </div>
      <h3 className="text-2xl font-bold mb-3 text-amber-950">Circular Fashion</h3>
      <p className="text-amber-950/60 leading-relaxed text-sm">
        Reducing landfill waste by breathing new life into forgotten fabrics.
      </p>
    </div>

    <CountUpTicker 
      value={1200} 
      label="Garments saved this month" 
      icon={<Leaf className="w-12 h-12 text-emerald-600" />}
    />

    <div className="feature-card h-full flex flex-col justify-center">
      <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
        <Sparkles className="w-7 h-7 text-purple-600" />
      </div>
      <h3 className="text-2xl font-bold mb-3 text-amber-950">AI Redesign</h3>
      <p className="text-amber-950/60 leading-relaxed text-sm">
        Neural networks generating unique, trend-aware upcycling blueprints.
      </p>
    </div>
  </div>

  {/* FIXED SECTION: Added ref and scroll-margin */}
  <section 
    ref={journeyRef} 
    className="pt-8 pb-0 scroll-mt-32" // scroll-mt-32 ensures the fixed navbar doesn't cover the title
  >
    <CircularJourney />
  </section>
</section>
      {/* FOOTER */}
      {/* Add this to the bottom of Landing.jsx */}
<footer className="bg-[#2C2621] text-[#FDFBF7] py-16 px-6 mt-4">
  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
    <div className="col-span-2">
      <h2 className="text-3xl font-black tracking-tighter mb-6">SECOND STITCH</h2>
      <p className="text-amber-100/60 max-w-sm leading-relaxed">
        We are building the world's first AI-driven circular fashion ecosystem. 
        Join us in turning the tide against fast fashion waste.
      </p>
    </div>
    <div>
      <h4 className="font-bold mb-6 text-amber-500 uppercase tracking-widest text-xs">Explore</h4>
      <ul className="space-y-4 opacity-80 text-sm font-medium">
        <li className="hover:text-amber-500 cursor-pointer">Neural Pattern Engine</li>
        <li className="hover:text-amber-500 cursor-pointer">Fabric Integrity Lab</li>
        <li className="hover:text-amber-500 cursor-pointer">Community Gallery</li>
      </ul>
    </div>
    <div>
      <h4 className="font-bold mb-6 text-amber-500 uppercase tracking-widest text-xs">Stay Conscious</h4>
      <div className="flex gap-2">
        <input 
          placeholder="Email address" 
          className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-full"
        />
        <button className="bg-amber-600 px-4 py-2 rounded-lg font-bold text-sm">Join</button>
      </div>
    </div>
  </div>
  <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/5 text-center text-xs opacity-40">
    © 2026 SECOND STITCH AI. ALL RIGHTS RESERVED.
  </div>
</footer>
    </PageWrapper>
  );
}