"use client";

import { downloadFeedbackReport } from "@/lib/ai-career-utils";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadReportButtonProps {
  interview: any;
  feedback: any;
}

export default function DownloadReportButton({ interview, feedback }: DownloadReportButtonProps) {
  return (
    <Button
      onClick={() => downloadFeedbackReport(interview, feedback)}
      className="btn-secondary flex-1"
    >
      <div className="flex w-full justify-center items-center gap-2">
        <Download size={16} />
        <p className="text-sm font-semibold text-primary-200 text-center">
          Download Report
        </p>
      </div>
    </Button>
  );
}
