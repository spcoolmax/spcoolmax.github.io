import Navbar from "@/components/Navbar";
import LifeProgress from "@/components/LifeProgress";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getAllPhotographs } from "@/lib/markdown";

export default function PhotographsPage() {
  const photographs = getAllPhotographs();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="pt-16">
        <LifeProgress />

        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden md:block">
            <div className="sticky top-24 space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                目录
              </h3>
              {photographs.map((photo) => (
                <Link
                  key={photo.slug}
                  href={`/photographs/${photo.slug}`}
                  className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  {photo.metadata.title}
                </Link>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
              Photographs
            </h1>

            {photographs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 dark:text-gray-400">
                  还没有照片，请在{' '}
                  <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">content/photographs/</code>{' '}
                  添加 Markdown 文件。
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {photographs.map((photo) => (
                  <Link
                    key={photo.slug}
                    href={`/photographs/${photo.slug}`}
                    className="group block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-xl hover:border-pink-500 dark:hover:border-pink-500 transition-all duration-300"
                  >
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                      {(() => {
                        const url = extractFirstImage(photo.content);
                        return url ? (
                          <img
                            src={url}
                            alt={photo.metadata.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-4xl">
                            ??
                          </div>
                        );
                      })()}
                    </div>
                    <div className="p-6">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors">
                        {photo.metadata.title}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(photo.metadata.date).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function extractFirstImage(md: string): string | null {
  const mdImg = /!\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)/.exec(md);
  if (mdImg && mdImg[1]) return sanitizeUrl(mdImg[1]);
  const htmlImg = /<img[^>]+src=["']([^"']+)["'][^>]*>/i.exec(md);
  if (htmlImg && htmlImg[1]) return sanitizeUrl(htmlImg[1]);
  return null;
}

function sanitizeUrl(url: string): string {
  const cleaned = url.replace(/[)"']+$/g, "");
  if (cleaned.startsWith("/")) return cleaned;
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return cleaned;
}

