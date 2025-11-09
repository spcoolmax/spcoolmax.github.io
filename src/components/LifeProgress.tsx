"use client";

import { useEffect, useState } from "react";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function LifeProgress() {
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [dayProgress, setDayProgress] = useState(0);

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const day = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), month + 1, 0).getDate();
    const progress = (day / daysInMonth) * 100;

    setCurrentMonth(month);
    setCurrentDay(day);
    setDayProgress(progress);
  }, []);

  // 初始渲染时避免闪动：未拿到日期就不渲染组件内容
  if (currentMonth === null || currentDay === null) {
    return null;
  }

  // 计算浮标位置（全年进度）
  const rawPos =
    ((currentMonth + dayProgress / 100) / 12) * 100; // 0-100%
  const clampedPos = Math.max(2, Math.min(98, rawPos)); // 防止贴边太难看

  return (
    <div className="w-full bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border-b border-gray-200/30 dark:border-gray-700/30 relative">
      <div className="group max-w-7xl mx-auto px-4 py-3 relative">
        {/* 年度进度条 */}
        <ul className="flex items-center justify-between gap-2">
          {Array.from({ length: 12 }).map((_, index) => {
            const isCurrentMonth = index === currentMonth;
            const isPast = index < currentMonth;

            return (
              <li
                key={index}
                className="relative flex-1 h-2 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full transition-all duration-700 ease-out ${
                    isPast
                      ? "w-full bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500"
                      : isCurrentMonth
                      ? "bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500"
                      : "w-0"
                  }`}
                  style={
                    isCurrentMonth
                      ? { width: `${dayProgress}%` }
                      : undefined
                  }
                />
              </li>
            );
          })}
        </ul>

        {/* 当前日期标签：放在进度条下方，鼠标悬停时显示 */}
        <div
          className="absolute bottom-0 z-40 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{
            left: `${clampedPos}%`,
            transform: "translate(-50%, 22px)",
          }}
        >
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {MONTHS[currentMonth]}
          </span>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {currentDay}
          </span>
        </div>
      </div>
    </div>
  );
}
