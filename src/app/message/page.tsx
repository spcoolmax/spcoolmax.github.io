"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import LifeProgress from "@/components/LifeProgress";
import Footer from "@/components/Footer";
import { MessageSquare, Clock, FileText } from "lucide-react";
import GiscusComments from "@/components/GiscusComments";
import { messages } from "../../../text.js";

export default function MessagePage() {
  const [comment, setComment] = useState("");
  const picked = useMemo(() => {
    if (!Array.isArray(messages) || messages.length === 0) return null;
    const idx = Math.floor(Math.random() * messages.length);
    return messages[idx] as { content: string[] | string; title?: string; author?: string };
  }, []);
  const pickedText = useMemo(() => {
    if (!picked) return "";
    return Array.isArray(picked.content)
      ? picked.content.join("\n")
      : String(picked.content ?? "");
  }, [picked]);
  const stats = useMemo(() => readingStats(pickedText), [pickedText]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="pt-16">
        <LifeProgress />

        {/* Message Board Section */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          {/* Header Info */}
          <div className="flex items-center justify-end gap-4 mb-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{stats.words.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{stats.minutes} minutes</span>
            </div>
          </div>

          {/* Quote Section (random each refresh) */}
          {picked && (
            <div className="mb-16">
              <blockquote className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6 font-serif whitespace-pre-line">
                {pickedText}
              </blockquote>
              <div className="text-right text-gray-600 dark:text-gray-400">
                {picked.title && <span className="mr-2">{picked.title}</span>}
                {picked.author && <span className="italic">{picked.author}</span>}
              </div>
            </div>
          )}

          {/* Quote Section (legacy, hidden) */}
          <div className="mb-16 hidden">
            <blockquote className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6 font-serif">
              我们靠去电影院看动作片，读惊悚小说，想象着"另一种生活"，结束后再回到原本的生活之中。很可惜，逃离是种不可能被满足的渴望。
            </blockquote>
            <div className="text-right text-gray-600 dark:text-gray-400">
              <span>———— </span>
              <span className="italic">Alec Soth</span>
            </div>
          </div>

          {/* Comments Section removed in favor of GitHub Comments */}{/* GitHub Comments */}
          <GiscusComments />
        </div>
      </div>

      <Footer />
    </div>
  );
}

function readingStats(md: string) {
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^\)]*\)/g, " ")
    .replace(/^#+\s+/gm, " ")
    .replace(/[*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const cjkChars = (text.match(/[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u30FF\uAC00-\uD7AF]/g) || []).length;
  const latinWords = (text.replace(/[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u30FF\uAC00-\uD7AF]/g, " ").trim().split(/\s+/).filter(Boolean) || []).length;
  const words = cjkChars + latinWords;
  const minutes = Math.max(1, Math.ceil((cjkChars / 300) + (latinWords / 200)));
  return { words, minutes };
}


