const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = name => fs.readFileSync(path.join(__dirname, "..", name), "utf8");

test("pure classic scripts also provide conditional CommonJS exports", () => {
  for (const name of ["dancingmen-logic.js", "dancingmen-messages.js"]) {
    const source = read(name);
    assert.doesNotMatch(source, /\b(?:document|window|navigator|localStorage|console)\b|\bfetch\s*\(/);
    assert.doesNotMatch(source, /^\s*(?:export|import)\s/m);
    assert.match(source, /if \(typeof module === "object" && module\.exports\) \{\s*module\.exports = \w+;\s*\}\s*$/);
    assert.doesNotMatch(source, /innerHTML|console\.|alert\s*\(|setAttribute\(["']style|\.cssText/);
  }
  const logic = read("dancingmen-logic.js").replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
  assert.doesNotMatch(logic, /[\u3040-\u30ff\u3400-\u9fff]/);
});

test("dependency-free Node 22 CI runs tests on pushes and pull requests", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.deepEqual(pkg, { name: "dancingmen-cipherlab", private: true, scripts: { test: "node --test" } });
  const workflow = read(".github/workflows/test.yml");
  assert.match(workflow, /^\s+push:/m);
  assert.match(workflow, /^\s+pull_request:/m);
  assert.match(workflow, /node-version: ["']?22/);
  assert.match(workflow, /run: npm test/);
  assert.doesNotMatch(read(".gitignore"), /\.github\/workflows/);
});

test("UI avoids unsafe DOM, external communication and non-dictionary Japanese literals", () => {
  const source = read("script.js");
  assert.doesNotMatch(source, /innerHTML|console\.|alert\s*\(|setAttribute\(["']style|\.cssText/);
  assert.doesNotMatch(source, /\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|image\/svg\+xml/);
  assert.doesNotMatch(source, /\.style\b|document\.execCommand/);
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
  assert.doesNotMatch(withoutComments, /[\u3040-\u30ff\u3400-\u9fff]/);
  assert.match(source, /querySelectorAll\('\[role="tab"\]'\)/);
  assert.match(source, /new Map\(\)/);
  assert.match(source, /globalCompositeOperation = "multiply"/);
});
