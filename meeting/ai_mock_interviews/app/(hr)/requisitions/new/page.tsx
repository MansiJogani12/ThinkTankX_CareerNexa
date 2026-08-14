"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default function NewRequisitionPage() {
  const router = useRouter();
  const [isExtracting, setIsExtracting] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [jd, setJd] = useState('');

  const handleExtractSkills = async () => {
    if (!jd) return;
    setIsExtracting(true);
    // Simulate AI extraction delay
    setTimeout(() => {
      setSkills(['React', 'TypeScript', 'Node.js', 'System Design', 'Agile']);
      setIsExtracting(false);
    }, 1500);
  };

  const handleSave = () => {
    // In a real app, save to Firebase here
    router.push('/requisitions');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4">
        <Link href="/requisitions">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Job Requisition</h1>
          <p className="text-gray-400 text-sm">Define the role and let AI extract the core requirements.</p>
        </div>
      </div>

      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white text-lg">Basic Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Job Title</label>
              <Input placeholder="e.g. Senior Frontend Engineer" className="bg-gray-900/50 border-gray-700 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Department</label>
              <Input placeholder="e.g. Engineering" className="bg-gray-900/50 border-gray-700 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Job Description</label>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-purple-600/10 text-purple-400 border-purple-500/30 hover:bg-purple-600/20"
                onClick={handleExtractSkills}
                disabled={isExtracting || !jd}
              >
                {isExtracting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Auto-Extract Skills
              </Button>
            </div>
            <Textarea 
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description here..." 
              className="min-h-[200px] bg-gray-900/50 border-gray-700 text-white resize-y" 
            />
          </div>
        </CardContent>
      </Card>

      {skills.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700/50 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Extracted Requirements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-gray-900/80 px-3 py-1.5 rounded-lg border border-gray-700">
                  <span className="text-sm text-gray-200">{skill}</span>
                  <select className="bg-transparent text-xs text-purple-400 outline-none cursor-pointer">
                    <option value="high">Must-Have (High)</option>
                    <option value="medium">Important (Med)</option>
                    <option value="low">Nice-to-Have (Low)</option>
                  </select>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              These skills and weights will be used to deterministically score candidates against this requisition.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white px-8">
          <Save className="w-4 h-4 mr-2" />
          Save Requisition
        </Button>
      </div>
    </div>
  );
}
