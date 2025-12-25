import React, { useState, useEffect } from "react";
import {
  motion,
  useTransform,
  useMotionValue,
  AnimatePresence
} from "framer-motion";
import {
  Zap,
  Shield,
  Cpu,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  Globe,
  Play
} from "lucide-react";

// --- UI Components ---

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  onClick,
  icon
}) => {
  const baseStyle = "inline-flex items-center justify-center px-6 py-3 rounded-full font-medium transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0C15] group relative overflow-hidden";

  const variants = {
    primary: "bg-indigo-600 text-white shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] hover:shadow-[0_0_25px_-5px_rgba(79,70,229,0.6)] border border-indigo-500/50",
    secondary: "bg-white/10 text-white hover:bg-white/15 border border-white/10 backdrop-blur-sm",
    outline: "bg-transparent text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon}
      </span>
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600"
          initial={{ x: '100%' }}
          whileHover={{ x: '-100%' }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          style={{ opacity: 0.5, mixBlendMode: 'overlay' }}
        />
      )}
    </motion.button>
  );
};

// --- Page Sections ---

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-[#0B0C15]/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Gemini<span className="text-indigo-400">SaaS</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {['Product', 'Solutions', 'Pricing', 'Docs'].map((item) => (
              <a key={item} href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</button>
            <Button variant="primary" className="py-2 px-5 text-xs" icon={<ChevronRight size={14} />}>Get Started</Button>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-slate-400 hover:text-white">
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0B0C15] border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {['Product', 'Solutions', 'Pricing', 'Docs'].map(item => (
                <a key={item} href="#" className="block text-lg font-medium text-slate-300 hover:text-white">
                  {item}
                </a>
              ))}
              <div className="pt-6 mt-6 border-t border-white/5 flex flex-col gap-4">
                <Button variant="secondary" className="w-full justify-center">Sign In</Button>
                <Button variant="primary" className="w-full justify-center">Get Started</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const Hero3DCard = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) - width / 2;
    const y = (clientY - top) - height / 2;

    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const rotateX = useTransform(mouseY, [-400, 400], [10, -10]);
  const rotateY = useTransform(mouseX, [-400, 400], [-10, 10]);
  const transformPerspective = 1000;

  return (
    <motion.div
      style={{ perspective: transformPerspective }}
      className="relative mx-auto max-w-5xl mt-20 px-4"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden aspect-[16/9] group"
      >
        {/* Reflection/Sheen Effect */}
        <motion.div
           className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 z-50"
           style={{ mixBlendMode: 'overlay' }}
        />

        {/* Mock Window Header */}
        <div className="h-10 bg-[#0F111A] border-b border-white/5 flex items-center px-4 gap-2 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
          </div>
          <div className="text-xs text-slate-600 font-mono">dashboard.tsx</div>
        </div>

        {/* Mock Content */}
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-48 bg-[#0F111A]/50 border-r border-white/5 p-4 hidden sm:flex flex-col gap-3">
             {[1,2,3,4].map(i => (
               <div key={i} className="h-8 rounded-lg bg-white/5 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
             ))}
          </div>

          {/* Main Area */}
          <div className="flex-1 p-8 bg-[#0B0C15] relative overflow-hidden">
             {/* Grid Background */}
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #4f46e5 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

             <div className="relative z-10 flex flex-col gap-6">
                <div className="flex gap-4">
                  <div className="flex-1 h-32 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 mb-2"></div>
                    <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                    <div className="h-8 w-16 bg-white/20 rounded"></div>
                  </div>
                  <div className="flex-1 h-32 rounded-xl bg-slate-800/50 border border-white/5 p-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 mb-2"></div>
                    <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                  </div>
                  <div className="flex-1 h-32 rounded-xl bg-slate-800/50 border border-white/5 p-4 hidden md:block">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 mb-2"></div>
                    <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                  </div>
                </div>

                <div className="h-48 rounded-xl bg-slate-800/30 border border-white/5 p-6 flex items-end justify-between gap-2">
                   {[40, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.1), type: "spring" }}
                        className="flex-1 bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                      />
                   ))}
                </div>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Background Glow behind card */}
      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-2xl opacity-20 -z-10 animate-pulse-slow"></div>
    </motion.div>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden selection:bg-indigo-500/30">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-medium mb-8 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          v2.0 is now live. Read the changelog.
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
        >
          Build Intelligent Apps <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient">
            at Light Speed
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto text-xl text-slate-400 mb-10 leading-relaxed font-light"
        >
          The comprehensive starter kit for modern SaaS.
          Everything you need to launch your next big idea, powered by industry-leading AI models.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button variant="primary" className="h-12 px-8 text-base w-full sm:w-auto" icon={<ArrowRight size={18} />}>
            Start Building Free
          </Button>
          <Button variant="secondary" className="h-12 px-8 text-base w-full sm:w-auto" icon={<Play size={16} />}>
            Watch Demo
          </Button>
        </motion.div>

        <Hero3DCard />
      </div>
    </section>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="group relative p-8 rounded-2xl bg-[#0F111A] border border-white/5 hover:border-indigo-500/30 transition-colors"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="relative z-10">
        <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300 border border-white/5 group-hover:border-indigo-500/50 shadow-lg">
          <Icon className="w-6 h-6 text-indigo-400 group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
      </div>
    </motion.div>
  );
};

const Features = () => {
  const features = [
    {
      title: "AI-First Architecture",
      description: "Built from the ground up to leverage LLMs for dynamic content generation, RAG pipelines, and reasoning agents.",
      icon: Cpu,
    },
    {
      title: "Global Edge Network",
      description: "Deployed to the edge for millisecond latency. Your users won't even have time to blink before the app loads.",
      icon: Globe,
    },
    {
      title: "Enterprise Security",
      description: "SOC2 compliant ready authentication, authorization, and data encryption at rest and in transit.",
      icon: Shield,
    }
  ];

  return (
    <section className="py-32 bg-[#0B0C15] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Why Developers Love Us</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            We've solved the infrastructure challenges so you can solve the business problems.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} delay={idx * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-[#0B0C15] border-t border-white/5 py-12 text-slate-400 text-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-2">
         <div className="w-8 h-8 bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-400">
           <Zap size={16} fill="currentColor" />
         </div>
         <span className="font-semibold text-slate-200">GeminiSaaS</span>
      </div>
      <div className="flex gap-8">
        <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-indigo-400 transition-colors">Twitter</a>
        <a href="#" className="hover:text-indigo-400 transition-colors">GitHub</a>
      </div>
    </div>
  </footer>
);

// --- Main App ---

const App = () => {
  return (
    <div className="min-h-screen bg-[#0B0C15] text-slate-200 overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default App;
