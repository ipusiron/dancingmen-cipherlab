const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const L = require("../dancingmen-logic.js");
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) <= 0.01, `${actual} != ${expected}`);

test("A-8 intrinsic figure dimensions retain a common scale", () => {
  assert.equal(L.FULL_PAD_X, 5);
  assert.equal(L.FULL_PAD_Y, 2);
  assert.equal(L.PX_PER_PT, 4 / 3);
  for (const letter of L.LETTERS) {
    const size = L.figureSize({ letter, flag: false });
    near(size.width, 51.73);
    near(size.height, 57.30);
    near(size.advance, 38.40);
  }
  for (const [letter, expected] of [
    ["E", { height: 61.46 }], ["T", { height: 63.31 }],
    ["M", { width: 51.79, height: 58.06, advance: 38.46 }],
    ["I", { width: 55.76, height: 64.59, advance: 42.43 }], ["P", { height: 66.70 }]
  ]) {
    const size = L.figureSize({ letter, flag: true });
    for (const [key, value] of Object.entries(expected)) near(size[key], value);
  }
});

test("A-9 only the root dimensions and viewBox change", () => {
  for (const [name, width, height] of [
    ["A", "38.8", "42.9775"], ["Af", "38.8", "47.965"],
    ["If", "41.8225", "48.445"], ["Mf", "38.845", "43.5475"]
  ]) {
    const original = fs.readFileSync(path.join(__dirname, `../assets/svg/tight/${name}.svg`), "utf8");
    const expanded = L.expandSvgViewBox(original);
    const rootTag = /<svg\b[^>]*>/;
    const expected = '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ' +
      `width="${width}pt" height="${height}pt" viewBox="-5 -2 ${width} ${height}" ` +
      'xmlns="http://www.w3.org/2000/svg" version="1.1">';
    assert.equal(expanded.match(rootTag)[0], expected);
    assert.equal(expanded.replace(rootTag, ""), original.replace(rootTag, ""));
  }
});

test("A-10 exact layouts, empty rows and PNG size boundaries", () => {
  const cases = [
    ["A", 84, 99, 1, 1, { name: "A.svg", x: 16, y: 25.4, w: 51.73, h: 57.3 }],
    ["COME HERE AT ONCE", 583, 99, 1, 14, { name: "E.svg", x: 515.2, y: 25.4 }],
    ["ELSIE PREPARE TO\nMEET THY GOD", 583, 178, 2, 24, { name: "D.svg", x: 361.6, y: 104.1 }],
    [L.allSamplesText(), 622, 751, 12, 76, { name: "E.svg", x: 515.2, y: 677.62 }],
    ["", 46, 32, 0, 0],
    ["A".repeat(207), 7995, 99, 1, 207],
    ["A".repeat(208), 8033, 99, 1, 208],
    [Array(101).fill("A").join("\n"), 84, 7970, 101, 101],
    [Array(102).fill("A").join("\n"), 84, 8048, 102, 102]
  ];
  for (const [raw, width, height, rows, count, last] of cases) {
    const layout = L.layoutCipher(L.encryptText(raw));
    assert.deepEqual([layout.width, layout.height, layout.rows, layout.figures.length], [width, height, rows, count]);
    if (last) {
      for (const [key, value] of Object.entries(last)) {
        if (typeof value === "number") near(layout.figures.at(-1)[key], value);
        else assert.equal(layout.figures.at(-1)[key], value);
      }
    }
  }
  assert.deepEqual(L.layoutCipher(L.encryptText("\nA\n")), L.layoutCipher(L.encryptText("A")));
});
