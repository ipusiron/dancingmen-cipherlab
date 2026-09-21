const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encryptText, toFontText, SAMPLES } = require("../dancingmen-logic.js");
const root = path.join(__dirname, "..");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const symbols = text => text.replaceAll("⏎", "\n").replaceAll("␣", " ");

test("README original six messages exactly match samples and generated notation", () => {
  const rows = [...readme.matchAll(/^\| ([1-6]) \| ([^|]+) \| ([^|]+) \|$/gm)];
  assert.equal(rows.length, 6);
  rows.forEach(([, number, plain, font], index) => {
    assert.equal(Number(number), index + 1);
    assert.equal(symbols(plain), SAMPLES[index].text);
    assert.equal(symbols(font), toFontText(encryptText(symbols(plain))));
  });
});

test("README five flag examples are present and match generated notation", () => {
  const section = readme.split("## 🚩 旗の規則")[1].split("\n## ")[0];
  const rows = [...section.matchAll(/^\| ([A-Z][^|]*) \| ([^|]+) \| ([^|]+) \|$/gm)];
  assert.equal(rows.length, 5);
  assert.deepEqual(rows.map(row => symbols(row[1])), [
    "HELLO WORLD", "HELLO　WORLD", "MEET ME\nAT NOON", "HELLO\n\nWORLD", "COME HERE AT ONCE "
  ]);
  for (const [, input, font] of rows) assert.equal(symbols(font), toFontText(encryptText(symbols(input))));
});

test("README YAML remains an HTML comment with block lists and original identity", () => {
  const metadata = /^<!--\r?\n---\r?\n([\s\S]*?)\r?\n---\r?\n-->/.exec(readme);
  assert.ok(metadata);
  for (const key of ["category_ja", "category_en", "tags"]) {
    assert.match(metadata[1], new RegExp(`^${key}:\\r?\\n  - \\S`, "m"));
  }
  for (const expected of [
    "id: day022", "slug: dancingmen-cipherlab", 'title: "DancingMen CipherLab"',
    'repo_url: "https://github.com/ipusiron/dancingmen-cipherlab"',
    'demo_url: "https://ipusiron.github.io/dancingmen-cipherlab/"', "hub: true"
  ]) assert.ok(metadata[1].split(/\r?\n/).includes(expected), expected);
});

test("README relative images exist and every root PNG is referenced", () => {
  const images = [...readme.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)]
    .map(match => match[1]).filter(file => !/^https?:/.test(file));
  assert.equal(images.length, 4);
  for (const file of images) assert.ok(fs.existsSync(path.join(root, file)), file);
  const actual = fs.readdirSync(path.join(root, "assets")).filter(file => file.endsWith(".png"));
  assert.deepEqual(actual.sort(), images.map(file => path.basename(file)).sort());
});

test("README tree covers every directory and file with an aligned description", () => {
  const section = readme.split("## 📁 ディレクトリー構造")[1];
  const block = /```text\n([\s\S]*?)\n```/.exec(section);
  assert.ok(block);
  const lines = block[1].split("\n");
  const expected = ["dancingmen-cipherlab/"];
  function walk(directory, prefix = "") {
    const entries = fs.readdirSync(directory, { withFileTypes: true })
      .filter(entry => ![".git", ".claude", "node_modules"].includes(entry.name))
      .sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
    entries.forEach((entry, index) => {
      const last = index === entries.length - 1;
      expected.push(prefix + (last ? "└── " : "├── ") + entry.name + (entry.isDirectory() ? "/" : ""));
      const file = path.join(directory, entry.name);
      const relative = path.relative(root, file).replaceAll("\\", "/");
      if (entry.isDirectory() && !/^assets\/svg\/(?:full|padded|tight)$/.test(relative)) {
        walk(file, prefix + (last ? "    " : "│   "));
      }
    });
  }
  walk(root);
  assert.ok(lines.length > 30);
  assert.equal(new Set(lines.map(line => line.indexOf("#"))).size, 1);
  for (const line of lines) assert.match(line, /\S +# [^\s].*$/);
  assert.deepEqual(lines.map(line => line.split("#")[0].trimEnd()), expected);
});

test("README obsolete claims and non-existent code examples are absent", () => {
  for (const obsolete of ["Elsei", "the God", "5つの暗号文", "EOFなら旗付き", "script.js:15-30"]) {
    assert.ok(!readme.includes(obsolete), obsolete);
  }
});
