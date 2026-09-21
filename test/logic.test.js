const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../dancingmen-logic.js");

const sanitizeCases = [
  ["HELLO　WORLD", "HELLO WORLD", [], 1, 0],
  ["HELLO\tWORLD", "HELLO WORLD", [], 1, 0],
  ["HELLO\u00a0WORLD", "HELLO WORLD", [], 1, 0],
  ["HELLO\r\nWORLD", "HELLO\nWORLD", [], 0, 0],
  ["HELLO\rWORLD", "HELLO\nWORLD", [], 0, 0],
  ["Am here, Abe Slaney!", "Am here Abe Slaney", [",", "!"], 0, 0],
  ["ＨＥＬＬＯ　ｗｏｒｌｄ", "HELLO world", [], 1, 10],
  ["A1 あB", "A B", ["1", "あ"], 0, 0],
  ["A😀B😀C", "ABC", ["😀"], 0, 0],
  ["A,,B!!", "AB", [",", "!"], 0, 0],
  ["   ", "   ", [], 0, 0]
];
for (const [raw, text, removed, replacedSpaces, replacedFullwidth] of sanitizeCases) {
  test(`sanitize ${JSON.stringify(raw)}`, () => {
    assert.deepEqual(L.sanitizeInput(raw), { text, removed, replacedSpaces, replacedFullwidth, truncated: false });
  });
}
test("2,000-character limit applies after normalization", () => {
  assert.equal(L.MAX_INPUT_LENGTH, 2000);
  assert.equal(L.sanitizeInput("X".repeat(2001)).text, "X".repeat(2000));
  assert.equal(L.sanitizeInput("X".repeat(2001)).truncated, true);
  assert.equal(L.sanitizeInput("X".repeat(2000)).truncated, false);
});

test("caret offsets A-3", () => {
  for (const [raw, caret, expected] of [
    ["HE1LLO WORLD", 3, 2], ["HE1LLO WORLD", 2, 2], ["ＨＥ", 2, 2],
    ["A　B", 2, 2], ["1234", 4, 0], ["AB", 0, 0], ["A😀B", 3, 1]
  ]) assert.equal(L.caretAfterSanitize(raw, caret), expected);
});

const helloFiles = "H.svg E.svg L.svg L.svg Of.svg W.svg O.svg R.svg L.svg D.svg";
const newlineFiles = "H.svg E.svg L.svg L.svg Of.svg\nW.svg O.svg R.svg L.svg D.svg";
const blankFiles = "H.svg E.svg L.svg L.svg O.svg\n\nW.svg O.svg R.svg L.svg D.svg";
const cases = [
  ...["HELLO WORLD", "hello world", "HELLO　WORLD", "HELLO\tWORLD", "HELLO  WORLD"]
    .map(raw => [raw, "hellO world", helloFiles, "HELLO WORLD", 10, 1]),
  ...["HELLO\nWORLD", "HELLO \nWORLD"]
    .map(raw => [raw, "hellO\nworld", newlineFiles, "HELLO\nWORLD", 10, 2]),
  ...["HELLO\n\nWORLD", "HELLO\n   \nWORLD"]
    .map(raw => [raw, "hello\n\nworld", blankFiles, "HELLO\n\nWORLD", 10, 3]),
  [" HELLO", "hello", "H.svg E.svg L.svg L.svg O.svg", "HELLO", 5, 1],
  ["HELLO ", "hellO", "H.svg E.svg L.svg L.svg Of.svg", "HELLO", 5, 1],
  ["HELLO\n", "hello", "H.svg E.svg L.svg L.svg O.svg", "HELLO", 5, 2],
  ["\nHELLO", "hello", "H.svg E.svg L.svg L.svg O.svg", "HELLO", 5, 2],
  ["A B C", "A B c", "Af.svg Bf.svg C.svg", "A B C", 3, 1],
  ["MEET ME\nAT NOON", "meeT mE\naT noon",
    "M.svg E.svg E.svg Tf.svg M.svg Ef.svg\nA.svg Tf.svg N.svg O.svg O.svg N.svg", "MEET ME\nAT NOON", 12, 2],
  ["AB\n CD", "aB\ncd", "A.svg Bf.svg\nC.svg D.svg", "AB\nCD", 4, 2],
  ["AB \n\nCD", "aB\n\ncd", "A.svg Bf.svg\n\nC.svg D.svg", "AB\n\nCD", 4, 3],
  ["Am here, Abe Slaney!", "aM herE abE slaney",
    "A.svg Mf.svg H.svg E.svg R.svg Ef.svg A.svg B.svg Ef.svg S.svg L.svg A.svg N.svg E.svg Y.svg",
    "AM HERE ABE SLANEY", 15, 1],
  ["", "", "", "", 0, 1], ["   ", "", "", "", 0, 1], ["\n\n", "", "", "", 0, 3]
];

function assertRoundTrip(raw) {
  const lines = L.encryptText(raw);
  const before = JSON.stringify(lines);
  const plain = L.decodeTokens(lines);
  assert.equal(plain, L.normalizePlain(raw), JSON.stringify(raw));
  for (const encode of [L.toFontText, L.toFileNameText]) {
    const parsed = L.parseCipherText(encode(lines));
    assert.deepEqual(parsed.invalid, []);
    assert.equal(L.decodeTokens(parsed.lines), plain);
  }
  L.layoutCipher(lines);
  assert.equal(JSON.stringify(lines), before);
}
for (const [raw, font, files, plain, count, rows] of cases) {
  test(`flag rules and round trip ${JSON.stringify(raw)}`, () => {
    const lines = L.encryptText(raw);
    assert.equal(L.toFontText(lines), font);
    assert.equal(L.toFileNameText(lines), files);
    assert.equal(L.decodeTokens(lines), plain);
    assert.equal(L.countLetters(lines), count);
    assert.equal(lines.length, rows);
    assertRoundTrip(raw);
  });
}

test("parse A-7 including filename ambiguity and invalid input", () => {
  const examples = [
    ["hellO world", "font", "HELLO WORLD", []],
    ["hellOworld", "font", "HELLO WORLD", []],
    ["H.svg E.svg L.svg L.svg Of.svg W.svg", "filenames", "HELLO W", []],
    ["Ff.svg f.svg ff.svg F.svg", "filenames", "F FF F", []],
    ["aM herE!\n\nnever 1", "font", "AM HERE\n\nNEVER", ["!", "1"]],
    ["A.svg Bx.svg .svg AA.svg", "filenames", "A", ["Bx.svg", ".svg", "AA.svg"]],
    ["am here", "font", "AMHERE", []],
    ["elsiE preparE tO\nmeeT thY god", "font", "ELSIE PREPARE TO\nMEET THY GOD", []]
  ];
  for (const [raw, notation, plain, invalid] of examples) {
    const parsed = L.parseCipherText(raw);
    assert.equal(parsed.notation, notation);
    assert.equal(L.decodeTokens(parsed.lines), plain);
    assert.deepEqual(parsed.invalid, invalid);
  }
  assert.equal(L.toFileNameText(L.parseCipherText("Ff.svg f.svg ff.svg F.svg").lines), "Ff.svg F.svg Ff.svg F.svg");
  assert.deepEqual(L.parseCipherText("\n\n").lines, [[], [], []]);
  assert.deepEqual(L.parseCipherText("A.SVG A.SVG").invalid, ["A.SVG"]);
});

test("300 deterministic generated strings round trip without mutation", () => {
  const alphabet = [..."ABZ az\n　\t,"];
  let seed = 20260921;
  function next() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  }
  for (let index = 0; index < 300; index++) {
    const length = next() % 41;
    const raw = Array.from({ length }, () => alphabet[next() % alphabet.length]).join("");
    const before = raw;
    assertRoundTrip(raw);
    assert.equal(raw, before);
  }
});
