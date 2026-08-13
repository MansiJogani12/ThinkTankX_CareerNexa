import Link from "next/link";
import { CheckCircle2, Sparkles, Mic, Compass } from "lucide-react";
import { Features as features } from "@/lib/ai-career-utils";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import { CareerTwin } from "@/components/CareerTwin";
import { NextBestActions } from "@/components/NextBestActions";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";
import { getUserCareerProfile } from "@/lib/career-profile";

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
  let careerProfile: any = null;

  if (user?.id) {
    const [userInterviewsRes, allInterviewRes, profileRes] = await Promise.all([
      getInterviewsByUserId(user.id),
      getLatestInterviews({ userId: user.id }),
      getUserCareerProfile(user.id),
    ]);
    userInterviews = userInterviewsRes || [];
    allInterview = allInterviewRes || [];
    careerProfile = profileRes;
  }

  const hasPastInterviews = userInterviews?.length > 0;
  const hasUpcomingInterviews = allInterview?.length > 0;

  return (
    <div className="relative pt-20 px-4 md:px-8 pb-12 min-h-screen">
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-10">

        {/* AI Career Twin & Next Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <CareerTwin profile={careerProfile} />
          <NextBestActions profile={careerProfile} />
        </div>

        {/* Simulator Banner */}
        <div className="bg-gradient-to-r from-violet-900/40 via-indigo-900/40 to-slate-900/40 border border-indigo-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Compass size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Career What-If Simulator</h3>
              <p className="text-white/60 text-xs mt-0.5">Explore how your match score & prep timeframe change if you shift career roles.</p>
            </div>
          </div>
          <Link
            href="/simulator"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-6 rounded-full transition-all whitespace-nowrap shadow-lg shadow-indigo-600/30"
          >
            Launch Simulator
          </Link>
        </div>

        {/* Features Section */}
        <section id="features" className="py-4">
          <div className="text-center mb-12 flex flex-col items-center">
            <span className="bg-white/5 border border-white/10 backdrop-blur-md text-violet-300 px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-2 mb-4">
              ✨ Premium AI Career Platform
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl">
              Five tools. One <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500">career leap.</span>
            </h2>
            <p className="text-white/60 mt-3 text-sm max-w-xl mx-auto">
              From your resume to the final interview, we've got every step covered with real-time AI capabilities.
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
                  Voice Mock Interview <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold animate-pulse">PROTECTED</span>
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">Practice real-time with an AI voice agent simulating actual technical and behavioral interview scenarios.</p>
              </div>
              <ul className="flex flex-col gap-2 mt-auto border-t border-white/5 pt-4">
                <li className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> Real-time voice interaction
                </li>
                <li className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle2 size={14} className="text-indigo-400 shrink-0" /> Immediate evaluation
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
        <div className="border-t border-white/10 pt-10">
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
