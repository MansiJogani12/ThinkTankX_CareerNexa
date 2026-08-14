"use client";

import React from "react";
import { Calendar } from "lucide-react";

interface SkillProgressChartProps {
  weeklyStudyHours: number[];
}

export function SkillProgressChart({ weeklyStudyHours }: SkillProgressChartProps) {
  const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const totalWeeklyHours = weeklyStudyHours.reduce((a, b) => a + b, 0);
  const maxStudyHour = Math.max(...weeklyStudyHours, 1); // Avoid div by 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">
            Weekly Learning Progress
          </p>
          <p className="text-lg font-bold text-indigo-400 mt-1">
            {totalWeeklyHours} hrs logged this week
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] text-white/50">
          <Calendar size={10} />
          <span>Mon-Sun</span>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative h-32 w-full mt-2 bg-white/5 rounded-xl border border-white/5 p-2">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="barGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(79, 70, 229, 0.2)" />
              <stop offset="100%" stopColor="rgba(79, 70, 229, 0.8)" />
            </linearGradient>
            <linearGradient id="barGradientHover" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
              <stop offset="100%" stopColor="rgba(129, 140, 248, 1)" />
            </linearGradient>
          </defs>
          
          {/* Chart Bars */}
          {weeklyStudyHours.map((hours, idx) => {
            const heightPercent = Math.max(5, (hours / maxStudyHour) * 100);
            const xOffset = 5 + idx * (90 / 6); // 7 bars spread across 0 to 100 viewbox width
            
            return (
              <g key={idx} className="group cursor-pointer">
                <rect
                  x={xOffset - 4}
                  y={100 - heightPercent}
                  width="8"
                  height={heightPercent}
                  fill="url(#barGradient)"
                  className="transition-all duration-300 group-hover:fill-[url(#barGradientHover)]"
                  rx="2"
                  ry="2"
                />
                
                {/* Tooltip value */}
                <text
                  x={xOffset}
                  y={100 - heightPercent - 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="4"
                  fontWeight="bold"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {hours}h
                </text>
                
                {/* Axis Label */}
                <text
                  x={xOffset}
                  y="108"
                  textAnchor="middle"
                  fill="rgba(255, 255, 255, 0.4)"
                  fontSize="4"
                  fontWeight="bold"
                >
                  {weekdayNames[idx]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
