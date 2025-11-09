import fs from "fs";
import path from "path";
import matter from "gray-matter";

const root = process.cwd();
const contentDir = path.join(root, "content");
const notesDir = path.join(contentDir, "notes");
const photosDir = path.join(contentDir, "photographs");
const outDir = path.join(root, "public");
const outFile = path.join(outDir, "search-index.json");

/** @typedef {{type: 'note'|'photograph', title: string, slug: string, path: string, date?: string, tags?: string[], category?: string, content: string}} IndexItem */

/** @returns {IndexItem[]} */
function collectNotes() {
  /** @type {IndexItem[]} */
  const out = [];
  if (!fs.existsSync(notesDir)) return out;

  /** @param {string} dir */
  function walk(dir, base="") {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full, base ? `${base}/${name}` : name);
      } else if (name.endsWith(".md")) {
        const raw = fs.readFileSync(full, "utf8");
        const { data, content } = matter(raw);
        const slug = (base ? `${base}/` : "") + name.replace(/\.md$/, "");
        out.push({
          type: "note",
          title: data.title || slug,
          slug,
          path: `/notes/${slug}`,
          date: data.date || undefined,
          tags: data.tags || undefined,
          category: data.category || undefined,
          content,
        });
      }
    }
  }
  walk(notesDir);
  return out;
}

/** @returns {IndexItem[]} */
function collectPhotos() {
  /** @type {IndexItem[]} */
  const out = [];
  if (!fs.existsSync(photosDir)) return out;
  /** @param {string} dir */
  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (name.endsWith(".md")) {
        const raw = fs.readFileSync(full, "utf8");
        const { data, content } = matter(raw);
        const rel = path.relative(photosDir, full).replace(/\.md$/, "");
        const slug = rel.split(path.sep).join("/");
        out.push({
          type: "photograph",
          title: data.title || slug,
          slug,
          path: `/photographs/${slug}`,
          date: data.date || undefined,
          content,
        });
      }
    }
  }
  walk(photosDir);
  return out;
}

const index = [...collectNotes(), ...collectPhotos()].sort((a, b) => {
  const ad = a.date ? new Date(a.date).getTime() : 0;
  const bd = b.date ? new Date(b.date).getTime() : 0;
  return bd - ad;
});

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify({ items: index }, null, 2), "utf8");
console.log(`Wrote ${index.length} items to ${path.relative(root, outFile)}`);
