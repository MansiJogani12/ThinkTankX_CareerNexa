import React from 'react';
import Link from 'next/link';
import { Plus, Briefcase, ChevronRight, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const mockRequisitions = [
  { id: '1', title: 'Senior Frontend Engineer', department: 'Engineering', status: 'Active', candidates: 45, daysOpen: 12 },
  { id: '2', title: 'DevOps Lead', department: 'Platform', status: 'Active', candidates: 18, daysOpen: 5 },
  { id: '3', title: 'Product Manager', department: 'Product', status: 'Draft', candidates: 0, daysOpen: 0 },
];

export default function RequisitionsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Job Requisitions</h1>
          <p className="text-gray-400">Manage your active job postings and skill requirements.</p>
        </div>
        <Link href="/requisitions/new">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Requisition
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 mt-8">
        {mockRequisitions.map((req) => (
          <Link key={req.id} href={`/requisitions/${req.id}`}>
            <Card className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/80 hover:border-purple-500/50 transition-all cursor-pointer group">
              <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-900/50 rounded-xl group-hover:bg-purple-900/20 transition-colors">
                    <Briefcase className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">{req.title}</h3>
                    <div className="flex items-center text-sm text-gray-400 mt-1 space-x-3">
                      <span>{req.department}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-600" />
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${req.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-300'}`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-400 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{req.candidates} candidates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{req.daysOpen} days</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors hidden sm:block" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
