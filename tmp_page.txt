import Navbar from "@/components/Navbar";
import LifeProgress from "@/components/LifeProgress";
import Footer from "@/components/Footer";
import GreetingHero from "@/components/GreetingHero";
import { getAllNotes, getAllPhotographs } from "@/lib/markdown";
import Link from "next/link";
import { extractFirstImageFromMarkdown } from "@/lib/utils";

export default function Home() {
  // 获取最新的3篇笔记
  const recentNotes = getAllNotes().slice(0, 3);

  // 获取所有相册
  const photographs = getAllPhotographs();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="pt-16">
        <div className="relative z-30">
          <LifeProgress />
        </div>

        {/* Hero Section */}
        <GreetingHero />

        {/* Additional Content Sections */}
        <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-16 space-y-12">
            {/* Recent Posts Section */}
            <section id="notes" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Recent Notes</h2>
                <Link
                  href="/notes"
                  className="text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 transition-colors"
                >
                  查看全部 →
                </Link>
              </div>

              {recentNotes.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                  <p className="text-gray-500 dark:text-gray-400">
                    还没有笔记，在 <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">content/notes/</code> 添加Markdown文件开始写作吧！
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentNotes.map((note) => (
                    <Link
                      key={note.slug}
                      href={`/notes/${note.slug}`}
                      className="block bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 text-xs font-medium bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded capitalize">
                          {note.metadata.category}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(note.metadata.date).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        {note.metadata.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {note.content.substring(0, 100)}...
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Photographs Section */}
            <section id="photographs" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Photographs</h2>
                <Link
                  href="/photographs"
                  className="text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 transition-colors"
                >
                  查看全部 →
                </Link>
              </div>

              {photographs.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                  <p className="text-gray-500 dark:text-gray-400">
                    还没有相册，在 <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">content/photographs/</code> 添加Markdown文件开始记录吧！
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photographs.slice(0, 4).map((photo) => (
                    <Link
                      key={photo.slug}
                      href={`/photographs/${photo.slug}`}
                      className="group aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 flex items-center justify-center relative"
                    >
                      {(() => {
                        const url = extractFirstImageFromMarkdown(photo.content);
                        return url ? (
                          <img
                            src={url}
                            alt={photo.metadata.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : null;
                      })()}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md shadow">
                        <span className="text-3xl mb-2 block">📷</span>
                        <span className="text-sm font-medium text-white drop-shadow">
                          {photo.metadata.title}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}








