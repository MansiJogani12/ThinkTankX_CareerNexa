import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Sparkles, Mic } from "lucide-react";
import { Features as features } from "@/lib/ai-career-utils";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

const featureLinks = [
  "/analyse",
  "/job-matcher",
  "/resume-builder",
  "/interview-prep"
];

async function Home() {
  const user = await getCurrentUser();

  let userInterviews: any[] = [];
  let allInterview: any[] = [];
  
  if (user?.id) {
    const [userInterviewsRes, allInterviewRes] = await Promise.all([
      getInterviewsByUserId(user.id),
      getLatestInterviews({ userId: user.id }),
    ]);
    userInterviews = userInterviewsRes || [];
    allInterview = allInterviewRes || [];
  }

  const hasPastInterviews = userInterviews?.length > 0;
  const hasUpcomingInterviews = allInterview?.length > 0;

  return (
    <div className="relative pt-20 px-4 md:px-8 pb-12 min-h-screen">
      <div className="relative z-10">
      {/* Features Section */}
      <section id="features" className="py-8 md:py-16 max-w-7xl mx-auto">
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="bg-white/5 border border-white/10 backdrop-blur-md text-violet-300 px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-2 mb-6">
            ✨ Premium Career Tools
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl">
            Five tools. One <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 animate-shimmer bg-[length:200%_auto]">career leap.</span>
          </h2>
          <p className="text-white/60 mt-6 text-lg max-w-xl mx-auto">
            From your resume to the final interview, we've got every step covered with state-of-the-art AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/interview"
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col gap-5 group hover:border-violet-500/50 hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <Mic size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-white flex items-center gap-2">
                Voice Mock Interview <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold animate-pulse">HOT</span>
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">Practice real-time with an AI voice agent that simulates an actual HR or technical interview environment with uncanny accuracy.</p>
            </div>
            <ul className="flex flex-col gap-2 mt-auto border-t border-white/5 pt-4">
              <li className="flex items-center gap-2 text-sm text-white/70">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> Real-time voice interaction
              </li>
              <li className="flex items-center gap-2 text-sm text-white/70">
                <CheckCircle2 size={14} className="text-indigo-400 shrink-0" /> Immediate feedback
              </li>
            </ul>
          </Link>

          {features.map(({ icon: Icon, color, glow, title, desc, bullets }, index) => (
            <Link
              href={featureLinks[index]}
              key={title}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col gap-5 group hover:border-violet-500/50 hover:bg-white/10 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-transform`}
              >
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  {title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </div>
              <ul className="flex flex-col gap-2 mt-auto border-t border-white/5 pt-4">
                {bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-2 text-sm text-white/70"
                  >
                    <CheckCircle2
                      size={14}
                      className="text-indigo-400 shrink-0"
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </section>

      {/* Existing Interviews Section */}
      <div className="max-w-7xl mx-auto border-t border-white/10 pt-16 mt-8">
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
             <div className="bg-violet-500/20 text-violet-400 p-2 rounded-lg">
                <Mic size={20} />
             </div>
             <h2 className="text-2xl font-bold text-white">Your Mock Interviews</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hasPastInterviews ? (
              userInterviews?.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  userId={user?.id}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                />
              ))
            ) : (
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center gap-4 col-span-full">
                  <Mic size={40} className="text-white/20 mb-2" />
                  <p className="text-white/60">You haven't taken any mock interviews yet.</p>
                  <Button className="btn-primary mt-2">
                     <Link href="/interview-prep">Start Your First Interview</Link>
                  </Button>
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-6 mt-16">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg">
                <Sparkles size={20} />
             </div>
             <h2 className="text-2xl font-bold text-white">Available Practice Interviews</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hasUpcomingInterviews ? (
              allInterview?.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  userId={user?.id}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                />
              ))
            ) : (
              <p className="text-white/40 bg-white/5 p-6 rounded-2xl border border-white/10">There are no practice interviews available right now.</p>
            )}
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}

export default Home;
