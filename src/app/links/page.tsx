import Navbar from "@/components/Navbar";
import LifeProgress from "@/components/LifeProgress";
import Footer from "@/components/Footer";

const links = [
  {
    name: "MAGNUM",
    url: "https://www.magnumphotos.com/",
    image: "https://ext.same-assets.com/640693365/870316940.svg",
    bgImage: "https://ext.same-assets.com/640693365/870316940.svg"
  },
  {
    name: "写真新世紀",
    url: "https://global.canon/en/newcosmos/",
    image: "",
    bgImage: "https://ext.same-assets.com/640693365/2897365503.jpeg"
  },
  {
    name: "214",
    url: "https://space.bilibili.com/8224871",
    image: "https://ext.same-assets.com/640693365/2152768725.jpeg",
    bgImage: ""
  },
  {
    name: "zzaoclub",
    url: "https://zzao.club/",
    image: "https://ext.same-assets.com/640693365/2059946699.png",
    bgImage: ""
  }
];

export default function LinksPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="pt-16">
        <LifeProgress />

        {/* Links Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  {link.bgImage ? (
                    <img
                      src={link.bgImage}
                      alt={link.name}
                      className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    />
                  ) : link.image ? (
                    <img
                      src={link.image}
                      alt={link.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
                  )}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />

                {/* Content */}
                <div className="absolute inset-0 flex items-end justify-center p-6">
                  <div className="text-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                      {link.name}
                    </h3>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
