import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getLatestInterviews } from "@/lib/actions/general.action";
import InterviewCard from "@/components/InterviewCard";

const Page = async () => {
  const user = await getCurrentUser();

  let allInterview: any[] = [];
  if (user?.id) {
    allInterview = (await getLatestInterviews({ userId: user.id })) || [];
  }

  const hasUpcomingInterviews = allInterview?.length > 0;

  return (
    <div className="pt-24 px-4 md:px-8 pb-12 min-h-screen max-w-7xl mx-auto flex flex-col gap-10">
      <div>
        <h3 className="text-2xl font-bold text-white mb-6">Interview generation</h3>

        <Agent
          userName={user?.name!}
          userId={user?.id}
          type="generate"
        />
      </div>

      <div className="border-t border-white/10 pt-10">
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-white">Available Practice Interviews</h2>

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
  );
};

export default Page;
