// Regenerate only full/; tight/ and padded/ are immutable source assets.
const fs = require("node:fs");
const path = require("node:path");
const { LETTERS, expandSvgViewBox } = require("../dancingmen-logic.js");
const root = path.join(__dirname, "..", "assets", "svg");
const check = process.argv.includes("--check");
const names = [...LETTERS].flatMap(letter => [`${letter}.svg`, `${letter}f.svg`]).sort();
const normalize = text => text.replace(/\r\n/g, "\n");
let differences = 0;

if (!check) fs.mkdirSync(path.join(root, "full"), { recursive: true });
for (const name of names) {
  const expanded = expandSvgViewBox(fs.readFileSync(path.join(root, "tight", name), "utf8"));
  const target = path.join(root, "full", name);
  if (check) {
    if (!fs.existsSync(target) || normalize(fs.readFileSync(target, "utf8")) !== normalize(expanded)) {
      process.stdout.write(`${name}\n`);
      differences++;
    }
  } else {
    fs.writeFileSync(target, expanded, "utf8");
  }
}
if (check && !differences) process.stdout.write("差分なし\n");
process.exitCode = differences ? 1 : 0;
