"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { UploadCloud, Search, Filter, Eye, EyeOff, MoreHorizontal, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const mockCandidates = [
  { id: 'C001', name: 'Alex Johnson', email: 'alex@example.com', matchScore: 92, atsScore: 88, status: 'Shortlisted' },
  { id: 'C002', name: 'Sam Smith', email: 'sam@example.com', matchScore: 85, atsScore: 80, status: 'Pending' },
  { id: 'C003', name: 'Taylor Swift', email: 'taylor@example.com', matchScore: 45, atsScore: 60, status: 'Rejected' },
  { id: 'C004', name: 'Jordan Lee', email: 'jordan@example.com', matchScore: 78, atsScore: 75, status: 'Pending' },
];

export default function CandidatesPage() {
  const [hidePII, setHidePII] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Candidate Pool</h1>
          <p className="text-gray-400">View and rank candidates against your requisitions.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
            onClick={() => setHidePII(!hidePII)}
          >
            {hidePII ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {hidePII ? "Show PII" : "Mask PII"}
          </Button>
          <Link href="/candidates/upload">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <UploadCloud className="w-4 h-4 mr-2" />
              Bulk Upload Resumes
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-xl">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates..." 
              className="pl-9 bg-gray-900/50 border-gray-700 text-white w-full"
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select className="bg-gray-900/50 border border-gray-700 text-white text-sm rounded-md px-3 py-2 w-full sm:w-auto outline-none">
              <option>Filter by Requisition</option>
              <option>Senior Frontend Engineer</option>
              <option>DevOps Lead</option>
            </select>
            <Button variant="outline" size="icon" className="border-gray-700 text-gray-400 hover:text-white shrink-0">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-gray-900/50 text-gray-400 border-b border-gray-700/50">
              <tr>
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Req Match %</th>
                <th className="px-6 py-4 font-medium">ATS Score</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockCandidates.map((c) => (
                <tr key={c.id} className="border-b border-gray-700/50 hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{hidePII ? `Candidate ${c.id}` : c.name}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{hidePII ? 'Hidden' : c.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-700 rounded-full h-1.5 max-w-[80px]">
                        <div className={`h-1.5 rounded-full ${c.matchScore > 80 ? 'bg-emerald-500' : c.matchScore > 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${c.matchScore}%` }}></div>
                      </div>
                      <span className={`font-medium ${c.matchScore > 80 ? 'text-emerald-400' : c.matchScore > 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {c.matchScore}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{c.atsScore}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                      c.status === 'Shortlisted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      c.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                      'bg-gray-700/50 text-gray-300 border-gray-600'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
