const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");

test("readable line lengths and minimum source line counts", () => {
  const minimums = { "index.html": 100, "script.js": 150, "style.css": 150, "dancingmen-logic.js": 150 };
  function inspect(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if ([".git", ".claude", "node_modules", "assets"].includes(entry.name)) continue;
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) inspect(file);
      else if (/\.(?:js|css|html)$/.test(entry.name)) {
        const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
        const maximum = entry.name === "index.html" ? 250 : 160;
        lines.forEach((line, index) => assert.ok([...line].length <= maximum, `${entry.name}:${index + 1} exceeds ${maximum}`));
        if (minimums[entry.name]) assert.ok(lines.length >= minimums[entry.name], entry.name);
      }
    }
  }
  inspect(root);
});
