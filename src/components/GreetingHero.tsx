"use client";

import { useState, useEffect } from "react";

const GREETINGS = [
  "Hello",            // English
  "你好",              // Chinese
  "こんにちは",         // Japanese
  "안녕하세요",          // Korean
  "Bonjour",          // French
  "Hola",             // Spanish
  "Ciao",             // Italian
  "Olá",              // Portuguese
  "Привет",           // Russian
  "Hallo",            // German
  "مرحبا",             // Arabic
  "नमस्ते",            // Hindi
  "Xin chào",         // Vietnamese
  "สวัสดีครับ",         // Thai
  "Γεια σου",         // Greek
  "שלום",              // Hebrew
  "Halo",             // Indonesian
  "Hej",              // Nordic
  "Moi",              // Finnish
];

export default function GreetingHero() {
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [idx, setIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = GREETINGS[greetingIndex];
    const speed = 40;            // 单字符速度
    const pauseAfterType = 1000; // 打完一行后停顿
    const pauseAfterDelete = 400; // 删完后停顿

    if (!deleting && idx < current.length) {
      // 正向打字
      const t = setTimeout(() => setIdx((v) => v + 1), speed);
      return () => clearTimeout(t);
    }

    if (!deleting && idx === current.length) {
      // 打完，准备删除
      const t = setTimeout(() => setDeleting(true), pauseAfterType);
      return () => clearTimeout(t);
    }

    if (deleting && idx > 0) {
      // 反向删除
      const t = setTimeout(() => setIdx((v) => v - 1), speed);
      return () => clearTimeout(t);
    }

    if (deleting && idx === 0) {
      // 换下一个 greeting
      const t = setTimeout(() => {
        setGreetingIndex((prev) => (prev + 1) % GREETINGS.length);
        setDeleting(false);
      }, pauseAfterDelete);
      return () => clearTimeout(t);
    }
  }, [idx, deleting, greetingIndex]);

  const current = GREETINGS[greetingIndex];
  const visibleGreeting = current.slice(0, idx);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* 背景模糊保留 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/back_ground/HISLab.JPG')",
          filter: "blur(8px)",
          transform: "scale(1.06)",
        }}
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* 右侧模块（再往右一点），内部左对齐 */}
      <div className="relative z-10 h-full flex items-start justify-end">
        <div className="mt-16 mr-2 md:mr-8 xl:mr-12">
          <pre
            className="
              inline-block
              font-mono
              text-[10px] md:text-xs
              text-gray-300
              leading-relaxed
              whitespace-pre
              text-left
            "
          >
{`/**


*

* `}{visibleGreeting || ""}
            <span className="inline-block animate-pulse">/</span>
{`

* Film / Rock / Night Coding


*

*/`}
          </pre>
        </div>
      </div>
    </div>
  );
}
