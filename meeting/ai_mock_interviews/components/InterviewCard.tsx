import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-violet-500/20 text-violet-300",
      Mixed: "bg-fuchsia-500/20 text-fuchsia-300",
      Technical: "bg-indigo-500/20 text-indigo-300",
    }[normalizedType] || "bg-indigo-500/20 text-indigo-300";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="bg-gradient-to-b from-white/20 to-transparent p-[1px] rounded-2xl w-[360px] max-sm:w-full min-h-96 group">
      <div className="bg-[#151722]/80 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col p-6 relative overflow-hidden gap-6 justify-between min-h-full transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] group-hover:border-violet-500/30">
        <div>
          {/* Type Badge */}
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg",
              badgeColor
            )}
          >
            <p className="badge-text ">{normalizedType}</p>
          </div>

          {/* Cover Image */}
          <div className="w-[90px] h-[90px] rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.2)] border border-white/10 overflow-hidden group-hover:scale-105 group-hover:rotate-3 transition-transform duration-500">
             <Image
                src={getRandomInterviewCover()}
                alt="cover-image"
                width={90}
                height={90}
                className="w-full h-full object-cover"
             />
          </div>

          {/* Interview Role */}
          <h3 className="mt-5 capitalize font-bold text-white group-hover:text-violet-300 transition-colors">
            {role} <span className="text-white/50">Interview</span>
          </h3>

          {/* Date & Score */}
          <div className="flex flex-row gap-3 mt-4 text-xs font-medium text-white/80">
            <div className="flex flex-row gap-2 items-center bg-white/5 border border-white/5 rounded-lg px-3 py-1.5">
              <Image
                src="/calendar.svg"
                width={14}
                height={14}
                alt="calendar"
              />
              <p>{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center bg-white/5 border border-white/5 rounded-lg px-3 py-1.5">
              <Image src="/star.svg" width={14} height={14} alt="star" />
              <p>{feedback?.totalScore || "---"}/100</p>
            </div>
          </div>

          {/* Feedback or Placeholder Text */}
          <div className="bg-white/5 rounded-xl p-3 mt-4">
              <p className="line-clamp-2 text-sm text-white/60">
                {feedback?.finalAssessment ||
                  "You haven't taken this interview yet. Take it now to improve your skills."}
              </p>
          </div>
        </div>

        <div className="flex flex-row justify-between items-center border-t border-white/10 pt-4 mt-2">
          <DisplayTechIcons techStack={techstack} />

          <Button className="btn-primary">
            <Link
              href={
                feedback
                  ? `/interview/${interviewId}/feedback`
                  : `/interview/${interviewId}`
              }
            >
              {feedback ? "Check Feedback" : "View Interview"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
