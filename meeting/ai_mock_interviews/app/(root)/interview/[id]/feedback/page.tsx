import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import DownloadReportButton from "@/components/DownloadReportButton";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  return (
    <section className="section-feedback mb-20">
      <div className="flex flex-col gap-3 items-center justify-center">
        <h1 className="text-4xl font-semibold text-center">
          Feedback on the Interview -{" "}
          <span className="capitalize">{interview.role}</span> Interview
        </h1>
      </div>

      <div className="flex flex-row justify-center ">
        <div className="flex flex-row gap-8 flex-wrap justify-center">
          {/* Overall Impression */}
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" width={22} height={22} alt="star" />
            <p className="text-white/80">
              Overall Impression:{" "}
              <span className="text-primary-200 font-bold text-xl">
                {feedback?.totalScore ?? 0}
              </span>
              /100
            </p>
          </div>

          {/* Date */}
          <div className="flex flex-row gap-2 items-center">
            <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p className="text-white/80">
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <hr className="border-white/10" />

      {/* Summary */}
      <div className="flex flex-col gap-3 bg-white/5 p-6 rounded-2xl border border-white/10">
        <h3 className="text-primary-200 text-lg font-bold">Interview Summary</h3>
        <p className="text-white/70 leading-relaxed">
          {feedback?.finalAssessment || "No summary assessment was generated for this session."}
        </p>
      </div>

      {/* Interview Breakdown */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Breakdown of the Interview:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {feedback?.categoryScores?.map((category, index) => (
            <div key={index} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <p className="font-bold text-white/90 text-md">
                  {category.name}
                </p>
                <span className="bg-primary-200/10 border border-primary-200/30 text-primary-200 px-3 py-1 rounded-full text-xs font-semibold">
                  {category.score}/100
                </span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">{category.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {/* Strengths */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-3">
          <h3 className="text-emerald-400 text-xl font-bold flex items-center gap-2">
            <span>✓</span> Strengths
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-sm text-white/70">
            {feedback?.strengths && feedback.strengths.length > 0 ? (
              feedback.strengths.map((strength, index) => (
                <li key={index} className="leading-relaxed">{strength}</li>
              ))
            ) : (
              <p className="text-white/40 text-xs italic">No strengths logged.</p>
            )}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-3">
          <h3 className="text-rose-400 text-xl font-bold flex items-center gap-2">
            <span>✗</span> Weaknesses
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-sm text-white/70">
            {feedback?.weaknesses && feedback.weaknesses.length > 0 ? (
              feedback.weaknesses.map((weak: string, index: number) => (
                <li key={index} className="leading-relaxed">{weak}</li>
              ))
            ) : feedback?.areasForImprovement && feedback.areasForImprovement.length > 0 ? (
              feedback.areasForImprovement.map((area: string, index: number) => (
                <li key={index} className="leading-relaxed">{area}</li>
              ))
            ) : (
              <p className="text-white/40 text-xs italic">No weaknesses logged.</p>
            )}
          </ul>
        </div>
      </div>

      {/* Actionable Suggestions & Recommended Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Suggestions */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-3">
          <h3 className="text-amber-400 text-xl font-bold">
            Actionable Suggestions
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-sm text-white/70">
            {feedback?.improvementSuggestions && feedback.improvementSuggestions.length > 0 ? (
              feedback.improvementSuggestions.map((sug: string, index: number) => (
                <li key={index} className="leading-relaxed">{sug}</li>
              ))
            ) : feedback?.areasForImprovement && feedback.areasForImprovement.length > 0 ? (
              feedback.areasForImprovement.slice(0, 3).map((area: string, index: number) => (
                <li key={index} className="leading-relaxed">{area}</li>
              ))
            ) : (
              <p className="text-white/40 text-xs italic">No specific suggestions generated.</p>
            )}
          </ul>
        </div>

        {/* Recommended Practice Topics */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-3">
          <h3 className="text-indigo-400 text-xl font-bold">
            Recommended Practice Topics
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {feedback?.recommendedTopics && feedback.recommendedTopics.length > 0 ? (
              feedback.recommendedTopics.map((topic: string, index: number) => (
                <span
                  key={index}
                  className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/80"
                >
                  {topic}
                </span>
              ))
            ) : (
              <p className="text-white/40 text-xs italic">Practice topics not defined.</p>
            )}
          </div>
        </div>
      </div>

      {/* Buttons / CTA Section */}
      <div className="buttons mt-8 flex flex-wrap gap-4 w-full">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              Back to dashboard
            </p>
          </Link>
        </Button>

        {feedback && (
          <DownloadReportButton interview={interview} feedback={feedback} />
        )}

        <Button className="btn-primary flex-1">
          <Link
            href={`/interview/${id}`}
            className="flex w-full justify-center"
          >
            <p className="text-sm font-semibold text-black text-center">
              Retake Interview
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;
