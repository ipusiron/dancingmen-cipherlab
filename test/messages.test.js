const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const L = require("../dancingmen-logic.js");
const M = require("../dancingmen-messages.js");

test("A-4 feedback keys, order and Japanese formatting", () => {
  const examples = [
    ["Am here, Abe Slaney!", ["使えない文字を取り除きました: 「,」「!」"]],
    ["HELLO　WORLD", ["全角の英字・スペースやタブを半角に置き換えました"]],
    ["Ｈｉ, 1", ["使えない文字を取り除きました: 「,」「1」", "全角の英字・スペースやタブを半角に置き換えました"]],
    ["X".repeat(2001), ["2,000文字を超えた分は切り捨てました"]],
    ["HELLO WORLD", []]
  ];
  for (const [raw, expected] of examples) {
    assert.deepEqual(L.feedbackItems(L.sanitizeInput(raw)).map(item => M.format("ja", item.key, item.values)), expected);
  }
  assert.deepEqual(L.feedbackItems(L.sanitizeInput("Ｈ," + "X".repeat(2001))), [
    { key: "feedback.removed", values: { chars: [","] } },
    { key: "feedback.replaced", values: {} },
    { key: "feedback.truncated", values: { max: "2,000" } }
  ]);
});

test("dictionary values are complete and unknown keys throw", () => {
  assert.equal(M.DEFAULT_LANG, "ja");
  assert.throws(() => M.format("ja", "unknown"));
  assert.throws(() => M.format("xx", "feedback.removed"));
  assert.throws(() => M.format("ja", "feedback.removed"));
  for (const [key, template] of Object.entries(M.dictionaries.ja)) {
    assert.ok(template.length > 0);
    const values = Object.fromEntries([...template.matchAll(/\{([^}]+)\}/g)].map(match => [match[1], "test"]));
    assert.doesNotMatch(M.format("ja", key, values), /\{/);
  }
});

test("UI message keys exist in the Japanese dictionary", () => {
  const source = fs.readFileSync(path.join(__dirname, "../script.js"), "utf8");
  const keys = [...source.matchAll(/\bt\(["']([^"']+)["']/g)].map(match => match[1]);
  assert.ok(keys.length > 0);
  for (const key of keys) assert.ok(Object.hasOwn(M.dictionaries.ja, key), key);
});
