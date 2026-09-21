const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const L = require("../dancingmen-logic.js");
const root = path.join(__dirname, "..");
const names = [...L.LETTERS].flatMap(letter => [`${letter}.svg`, `${letter}f.svg`]).sort();
const read = name => fs.readFileSync(path.join(root, name), "utf8").replace(/\r\n/g, "\n");

test("156 assets have exactly the expected names, dimensions, comments and safe content", () => {
  assert.equal(names.length, 52);
  assert.equal(Object.keys(L.TIGHT_VIEWBOX).length, 52);
  for (const folder of ["tight", "padded", "full"]) {
    assert.deepEqual(fs.readdirSync(path.join(root, "assets/svg", folder)).sort(), names);
    for (const name of names) {
      const svg = read(`assets/svg/${folder}/${name}`);
      const comment = name.includes("f.") ? name[0] : name[0].toLowerCase();
      assert.ok(svg.includes(`<!-- ${comment} -->`), `${folder}/${name}`);
      assert.doesNotMatch(svg, /<script|foreignObject|href\s*=\s*["']https?:/i);
      const box = /viewBox="([^"]+)"/.exec(svg)[1].split(" ").map(Number);
      if (folder === "tight") assert.deepEqual(box, [0, 0, ...L.TIGHT_VIEWBOX[name.replace(".svg", "")]]);
      if (folder === "padded") assert.deepEqual(box, [0, 0, 72, 72]);
      if (folder === "full") assert.equal(svg, L.expandSvgViewBox(read(`assets/svg/tight/${name}`)));
    }
  }
});

function manifest(folders) {
  const hash = createHash("sha256");
  const paths = folders.flatMap(folder => names.map(name => `assets/svg/${folder}/${name}`)).sort();
  for (const name of paths) hash.update(name + "\n" + read(name));
  return hash.digest("hex");
}
test("104 original SVGs remain unchanged", () => {
  assert.equal(manifest(["tight", "padded"]), "e1d99427499b8c1ebbaf37f7021c38dfdd4176a36fd4cd8561a7f5a7c3270c57");
});
test("provided full SVGs preserve their byte size and manifest", () => {
  assert.equal(manifest(["full"]), "97ab4c22ebbbed6d78913d2b6a73227fd61cbf61b3a6f1a66fca9e79054dc69a");
  assert.equal(names.reduce((sum, name) => sum + fs.statSync(path.join(root, "assets/svg/full", name)).size, 0), 141374);
});
