const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const M = require("../dancingmen-messages.js");
const I18n = require("../i18n.js");
const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const html = read("index.html");
const script = read("script.js");
const i18n = read("i18n.js");
const JAPANESE = /[぀-ヿ㐀-鿿]/;

test("Japanese and English cover exactly the same keys", () => {
  assert.deepEqual(M.LANGUAGES, ["ja", "en"]);
  const ja = Object.keys(M.dictionaries.ja);
  const en = Object.keys(M.dictionaries.en);
  assert.ok(ja.length >= 60, String(ja.length));
  assert.deepEqual(ja.filter(key => !Object.hasOwn(M.dictionaries.en, key)), []);
  assert.deepEqual(en.filter(key => !Object.hasOwn(M.dictionaries.ja, key)), []);
  assert.deepEqual([...Object.keys(M.dictionaries.en)], ja);
});

test("placeholder names agree between the two languages", () => {
  const holes = template => [...String(template).matchAll(/\{([^}]+)\}/g)].map(match => match[1]).sort().join(",");
  const mismatched = Object.keys(M.dictionaries.ja)
    .filter(key => holes(M.dictionaries.ja[key]) !== holes(M.dictionaries.en[key]));
  assert.deepEqual(mismatched, []);
});

test("every key index.html points at exists in both dictionaries", () => {
  const keys = new Set([...html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)].map(match => match[1]));
  assert.ok(keys.size >= 40, `too few data-i18n attributes: ${keys.size}`);
  assert.deepEqual([...keys].filter(key => !Object.hasOwn(M.dictionaries.ja, key)), []);
  assert.deepEqual([...keys].filter(key => !Object.hasOwn(M.dictionaries.en, key)), []);
});

test("every key script.js asks for exists in both dictionaries", () => {
  const keys = [
    ...[...script.matchAll(/\bt\(["']([^"']+)["']/g)].map(match => match[1]),
    ...[...script.matchAll(/\bkey: ["']([^"']+)["']/g)].map(match => match[1]),
    ...[...script.matchAll(/setStatus\("[\w-]+", [^)]*?["']([\w.]+\.[\w.]+)["']/g)].map(match => match[1])
  ];
  assert.ok(keys.length >= 15, String(keys.length));
  for (const key of keys) {
    assert.ok(Object.hasOwn(M.dictionaries.ja, key), `ja/${key}`);
    assert.ok(Object.hasOwn(M.dictionaries.en, key), `en/${key}`);
  }
});

test("no Japanese is left in the English dictionary, and no English placeholder in Japanese", () => {
  // 言語の切り替えボタンだけは、相手の言語を出すのが正しい。
  const expected = new Set(["app.langButton"]);
  const left = Object.keys(M.dictionaries.en)
    .filter(key => !expected.has(key) && JAPANESE.test(M.dictionaries.en[key]));
  assert.deepEqual(left, []);
  assert.equal(M.dictionaries.en["app.langButton"], "日本語");
  assert.equal(M.dictionaries.ja["app.langButton"], "English");
  for (const key of Object.keys(M.dictionaries.ja)) {
    if (key === "footer.repoEnd") continue;
    assert.ok(M.dictionaries.en[key].length > 0, key);
  }
});

test("t() fills placeholders, wraps lists and refuses unknown keys", () => {
  assert.equal(I18n.language, "ja");
  assert.match(I18n.t("figure.flag", { letter: "O" }), /^O（旗あり）$/);
  assert.equal(I18n.t("feedback.removed", { chars: [",", "!"] }), "使えない文字を取り除きました: 「,」「!」");
  assert.throws(() => I18n.t("no.such.key"), /Unknown message/);
  assert.throws(() => I18n.t("figure.flag"), /Missing message value/);
  assert.equal(M.format("en", "feedback.removed", { chars: [","] }),
    "Removed the characters that cannot be used: “,”");
  assert.ok(I18n.supported("ja") && I18n.supported("en") && !I18n.supported("de"));
  assert.equal(I18n.STORAGE_KEY, "dancingmen-cipherlab-language");
});

test("i18n.js loads before the other scripts and stays free of unsafe DOM writes", () => {
  const order = ["dancingmen-messages.js", "i18n.js", "dancingmen-logic.js", "script.js"]
    .map(name => html.indexOf(`<script src="${name}">`));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
  assert.ok(order.every(index => index > 0));
  assert.doesNotMatch(i18n, /innerHTML|console\.|alert\s*\(|\bfetch\s*\(|document\.write/);
  assert.match(i18n, /localStorage\.setItem/);
  assert.match(i18n, /new URLSearchParams\(location\.search\)/);
});

test("the UI never decides its state by comparing displayed text", () => {
  // 言語を変えると文字列が変わるため、表示中の文言との一致で分岐してはいけない。
  assert.doesNotMatch(script, /textContent\s*===|\.textContent\s*!==|includes\(["'][^"']*[぀-鿿]/);
  assert.doesNotMatch(script, /value\s*===\s*["'][^"']*[぀-鿿]/);
  assert.match(script, /dataset\.flag === "true"/);
  assert.match(script, /id === "all"/);
});

test("status messages are stored as keys, so a switch keeps them instead of clearing them", () => {
  // 翻訳済みの文字列を要素へ直接入れると、言語を変えたときに訳し直せない。
  assert.doesNotMatch(script, /status\.textContent\s*=/);
  assert.doesNotMatch(script, /getElementById\("(?:save-status|decode-status|copy-toast|font-copy-status)"\)\.textContent\s*=/);
  assert.match(script, /const statusMessages = new Map\(\);/);
  assert.match(script, /function setStatus\(id, items = \[\], separator = ""\)/);
  assert.match(script, /statusMessages\.set\(id, \{ items, separator \}\)/);
  assert.match(script, /const shown = new Map\(statusMessages\);/);
  assert.match(script, /renderStatuses\(\);/);
});

test("the language switch rebuilds the generated figures, table and samples", () => {
  assert.match(script, /document\.addEventListener\("languagechange", renderLanguage\)/);
  for (const call of ["generateDecryptButtons();", "generateTable();", "generateSamples();", "encrypt();",
    "updateDecryption();"]) {
    assert.ok(script.includes(call), call);
  }
  assert.match(script, /I18n\.init\(\);/);
  assert.match(script, /container\.replaceChildren\(\);/);
  assert.match(script, /select\.replaceChildren\(\);/);
});

test("noscript names both languages, and the page keeps its Japanese default markup", () => {
  const noscript = html.match(/<noscript>([^<]+)<\/noscript>/)[1];
  assert.ok(JAPANESE.test(noscript), noscript);
  assert.match(noscript, /JavaScript/);
  assert.match(noscript, / \/ /);
  assert.match(html, /<html lang="ja">/);
});

test("README.en.md exists and both READMEs link to each other", () => {
  const english = read("README.en.md");
  const japanese = read("README.md");
  assert.match(english, /^English · \[日本語\]\(README\.md\)/m);
  assert.match(japanese, /^\[English\]\(README\.en\.md\) · 日本語/m);
  const headings = [...english.matchAll(/^#{1,4} (.+)$/gm)].map(match => match[1]);
  assert.ok(headings.length >= 10, String(headings.length));
  assert.deepEqual(headings.filter(heading => JAPANESE.test(heading)), []);
  assert.ok(english.includes("i18n.js") && english.includes("i18n.test.js"));
  assert.match(english, /\?lang=en/);
  for (const url of ["https://ipusiron.github.io/dancingmen-cipherlab/",
    "https://github.com/ipusiron/dancingmen-cipherlab"]) {
    assert.ok(english.includes(url), url);
  }
});
