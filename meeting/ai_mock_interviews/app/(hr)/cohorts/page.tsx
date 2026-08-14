import React from 'react';
import { GitMerge, MoreVertical, BookOpen, UserCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mockCohorts = [
  { id: '1', name: 'Summer 2024 Engineering Interns', trainees: 45, completion: 82, status: 'Active', atRisk: 3 },
  { id: '2', name: 'Q3 Backend Developer Bootcamp', trainees: 120, completion: 45, status: 'Active', atRisk: 12 },
  { id: '3', name: 'Data Science Conversion Program', trainees: 15, completion: 100, status: 'Completed', atRisk: 0 },
];

export default function CohortsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Cohorts & Training Paths</h1>
          <p className="text-gray-400">Group candidates and assign personalized skill roadmaps.</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <GitMerge className="w-4 h-4 mr-2" />
          Create Cohort
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-8">
        {mockCohorts.map((cohort) => (
          <div key={cohort.id} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/80 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-white">{cohort.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${cohort.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-300'}`}>
                    {cohort.status}
                  </span>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-400 mt-2">
                  <div className="flex items-center space-x-1.5">
                    <UserCheck className="w-4 h-4 text-purple-400" />
                    <span>{cohort.trainees} Trainees</span>
                  </div>
                  {cohort.atRisk > 0 && (
                    <div className="flex items-center space-x-1.5 text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>{cohort.atRisk} At Risk</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1.5">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span>Assigned Roadmap: Advanced Python</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-8 w-full md:w-auto">
                <div className="flex-1 md:w-48">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Aggregate Progress</span>
                    <span>{cohort.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${cohort.completion}%` }}></div>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white shrink-0">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
