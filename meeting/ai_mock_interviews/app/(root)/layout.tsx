import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";
import { MentorChat } from "@/components/MentorChat";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="PrepWise Logo" width={32} height={32} />
          <h2 className="text-violet-500 font-bold text-xl">PrepWise</h2>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/analyse" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Analyse</Link>
          <Link href="/skill-gap" className="text-sm font-medium text-white/70 hover:text-white transition-colors">SkillGap</Link>
          <Link href="/roadmap" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Roadmap</Link>
          <Link href="/recommendations" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Recommendations</Link>
          <Link href="/dashboard" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Dashboard</Link>
          <Link href="/job-matcher" className="text-sm font-medium text-white/70 hover:text-white transition-colors">JobMatcher</Link>
          <Link href="/resume-builder" className="text-sm font-medium text-white/70 hover:text-white transition-colors">ResumeBuilder</Link>
          <Link href="/interview-prep" className="text-sm font-medium text-white/70 hover:text-white transition-colors">InterviewPrep</Link>
          <Link href="/interview" className="text-sm font-medium text-white/70 hover:text-white transition-colors">MockInterview</Link>
          <Link href="/about" className="text-sm font-medium text-white/70 hover:text-white transition-colors">About</Link>
        </div>
        
        {/* Placeholder for right side to balance flex layout */}
        <div className="w-32 hidden md:block"></div>
      </nav>

      {children}
      <MentorChat />
    </div>
  );
};

export default Layout;
