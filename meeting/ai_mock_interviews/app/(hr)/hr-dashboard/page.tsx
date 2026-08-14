import React from 'react';
import { Users, Briefcase, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function HRDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">HR Overview</h1>
        <p className="text-gray-400">Manage requisitions, track candidates, and analyze cohort performance.</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Active Requisitions" value="12" icon={Briefcase} trend="+2 this week" trendUp={true} />
        <MetricCard title="Total Candidates" value="1,248" icon={Users} trend="+145 this week" trendUp={true} />
        <MetricCard title="Average Match Score" value="78%" icon={TrendingUp} trend="+3% vs last month" trendUp={true} />
        <MetricCard title="At-Risk Trainees" value="24" icon={AlertTriangle} trend="-5 vs last month" trendUp={true} warning />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <Card className="lg:col-span-2 bg-gray-800/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-gray-200 font-semibold flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span>Pipeline Conversion</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-gray-700/50">
            <p className="text-gray-500 italic">Conversion funnel chart will render here</p>
          </CardContent>
        </Card>

        {/* Quick Actions / Status */}
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-gray-200 font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActivityItem title="Frontend Engineer Batch Scored" time="2 hours ago" status="completed" />
            <ActivityItem title="New Requisition: DevOps Lead" time="5 hours ago" status="new" />
            <ActivityItem title="Cohort 'Summer 2024' completed React module" time="1 day ago" status="completed" />
            <ActivityItem title="Backend Developer batch processing" time="2 days ago" status="warning" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, trendUp, warning }: any) {
  return (
    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-800/80 transition-all cursor-default">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="p-3 bg-gray-900/50 rounded-xl">
            <Icon className={`w-6 h-6 ${warning ? 'text-amber-400' : 'text-purple-400'}`} />
          </div>
          {trend && (
            <span className={`text-sm font-medium ${warning ? (trendUp ? 'text-amber-400' : 'text-emerald-400') : (trendUp ? 'text-emerald-400' : 'text-red-400')}`}>
              {trend}
            </span>
          )}
        </div>
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ title, time, status }: { title: string, time: string, status: 'completed' | 'new' | 'warning' }) {
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'new': return 'bg-purple-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
      <div className={`mt-1.5 w-2 h-2 rounded-full ${getStatusColor()} flex-shrink-0`} />
      <div>
        <p className="text-sm font-medium text-gray-200">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}
