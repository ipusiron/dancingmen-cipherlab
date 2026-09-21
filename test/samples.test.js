const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../dancingmen-logic.js");

const expected = [
  ["m1", "AM HERE ABE SLANEY", "aM herE abE slaney"],
  ["m2", "AT ELRIGES", "aT elriges"],
  ["m3", "COME ELSIE", "comE elsie"],
  ["m4", "NEVER", "never"],
  ["m5", "ELSIE PREPARE TO\nMEET THY GOD", "elsiE preparE tO\nmeeT thY god"],
  ["m6", "COME HERE AT ONCE", "comE herE aT once"]
];
test("six original messages and the explicit trailing-space exception", () => {
  assert.equal(L.SAMPLES.length, 6);
  assert.deepEqual(L.SAMPLES.map(sample => [sample.id, sample.text, L.toFontText(L.encryptText(sample.text))]), expected);
  assert.equal(L.toFontText(L.encryptText("COME HERE AT ONCE ")), "comE herE aT oncE");
});
test("all messages: twelve rows, 76 figures, eight absent letters", () => {
  const lines = L.encryptText(L.allSamplesText());
  const font = "aM herE abE slaney\n\naT elriges\n\ncomE elsie\n\nnever\n\nelsiE preparE tO\nmeeT thY god\n\ncomE herE aT once";
  assert.equal(L.toFontText(lines), font);
  assert.equal(lines.length, 12);
  assert.equal(L.countLetters(lines), 76);
  const used = new Set(lines.flat().map(token => token.letter));
  assert.deepEqual([...L.LETTERS].filter(letter => !used.has(letter)), [..."FJKQUWXZ"]);
  const first = L.encryptText(L.SAMPLES[0].text).flat();
  assert.equal(first.length, 15);
  assert.equal(first.filter(token => token.letter === "E").length, 4);
  assert.equal(first.filter(token => token.letter === "A").length, 3);
});
