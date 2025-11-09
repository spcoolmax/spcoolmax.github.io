"use client";

import { useState, useEffect } from "react";

export default function GreetingHero() {
  const greetings = [
    "こんにちは", // Japanese
    "Hello", // English
    "你好", // Chinese
    "Bonjour", // French
    "Hola", // Spanish
    "Ciao", // Italian
    "Olá", // Portuguese
    "Привет", // Russian
    "안녕하세요", // Korean
    "Hallo", // German
  ];

  const [currentGreeting, setCurrentGreeting] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGreeting((prev) => (prev + 1) % greetings.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [greetings.length]);

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden">
      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/back_ground/HISLab.JPG')",
          filter: "blur(8px)",
          transform: "scale(1.1)",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/30 via-gray-900/50 to-gray-900/70" />

      {/* Content - Positioned in top right */}
      <div className="relative z-10 h-full flex items-start justify-end p-8 md:p-16 lg:p-20">
        <div className="bg-white/10 dark:bg-gray-900/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-10 shadow-2xl animate-fade-in max-w-md">
          <div className="font-mono text-sm md:text-base space-y-2 text-gray-100">
            <p className="text-gray-300">{'/**'}</p>
            <p className="text-gray-300">{'*'}</p>
            <p className="text-gray-300">
              {'* '}
              <span
                key={currentGreeting}
                className="text-2xl md:text-3xl font-normal inline-block transition-all duration-500 animate-fade-in"
              >
                {greetings[currentGreeting]}
              </span>
            </p>
            <p className="text-gray-300">
              {'* '}
              <a
                href="mailto:Film / Guitar / Night Coding"
                className="text-pink-400 hover:text-pink-300 transition-colors underline decoration-pink-400/30 hover:decoration-pink-300/50"
              >
                Film / Guitar / Night Coding
              </a>
            </p>
            <p className="text-gray-300">{'*'}</p>
            <p className="text-gray-300">{'*/'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
