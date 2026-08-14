import Image from "next/image";
import { Star, Code2, Users, Target, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 max-w-5xl mx-auto text-white pb-20">
      <div className="text-center mb-16">
        <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-2 mb-4">
          <Star size={11} /> About Us
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Empowering your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 animate-shimmer bg-[length:200%_auto]">career journey.</span>
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
          PrepWise is the ultimate AI-powered career toolkit. We bridge the gap between talented individuals and their dream jobs by offering state-of-the-art tools for resume building, skill analysis, and interview preparation.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <p className="text-white/60 leading-relaxed">
            Navigating the job market can be overwhelming. We believe everyone deserves access to high-quality career guidance. That's why we've built a comprehensive suite of tools that leverage advanced Artificial Intelligence to provide personalized, actionable insights—from optimizing your resume for ATS systems to practicing real-time mock interviews.
          </p>
          <div className="flex flex-col gap-4 mt-2">
            {[
              { icon: Target, text: "Precision matching with top job opportunities" },
              { icon: Code2, text: "Technical and HR interview preparation" },
              { icon: ShieldCheck, text: "ATS-friendly resume optimization" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-4 text-white/80">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-indigo-400" />
                </div>
                <p className="font-medium text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold">Why Choose PrepWise?</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Unlike traditional platforms, PrepWise doesn't just give generic advice. Our AI analyzes your specific background and the roles you're targeting to generate tailored recommendations, custom interview questions, and a flawlessly formatted resume that highlights your true potential.
            </p>
            <div className="h-px w-full bg-white/10" />
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white">5+</span>
                <span className="text-xs text-white/40 uppercase tracking-widest mt-1">AI Tools</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white">24/7</span>
                <span className="text-xs text-white/40 uppercase tracking-widest mt-1">Availability</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white">100%</span>
                <span className="text-xs text-white/40 uppercase tracking-widest mt-1">Personalized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center flex flex-col items-center justify-center border-t border-white/10 pt-16">
        <Image src="/logo.svg" alt="PrepWise Logo" width={48} height={48} className="mb-6 opacity-80" />
        <h2 className="text-2xl font-bold mb-2">Ready to take the next step?</h2>
        <p className="text-white/50 text-sm mb-8">Join thousands of professionals landing their dream roles.</p>
      </div>
    </div>
  );
}
