const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");

test("HTML security, local classic script order and no inline code", () => {
  const csp = html.match(/<meta\b[^>]*http-equiv="Content-Security-Policy"[^>]*>/i)?.[0];
  assert.ok(csp);
  assert.match(csp, /default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self';/);
  assert.match(csp, /base-uri 'none'; form-action 'none'; object-src 'none'/);
  assert.doesNotMatch(csp, /frame-ancestors|blob:|data:|unsafe-/);
  assert.match(html, /<meta name="referrer" content="no-referrer"/);
  assert.match(html, /<meta name="viewport"/);
  assert.match(html, /<noscript>[^<]+<\/noscript>/);
  assert.match(html, /<link rel="icon" type="image\/svg\+xml" href="assets\/svg\/padded\/Ef.svg"/);
  assert.doesNotMatch(html, /\s(?:on\w+|style)\s*=/i);
  assert.doesNotMatch(html, /<script[^>]*type=["']module["']/i);
  assert.deepEqual([...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(match => match[1]), [
    "dancingmen-messages.js", "dancingmen-logic.js", "script.js"
  ]);
  assert.doesNotMatch(html, /<(?:script|link|img)\b[^>]*(?:src|href)=["']https?:\/\//i);
  for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    assert.match(match[0], /rel="noopener noreferrer"/);
  }
});

test("accessible tabs, dialog, textareas and all required element IDs", () => {
  const ids = [
    "plaintext", "validation-feedback", "char-count", "sample-select", "sample-load", "output", "ciphertext",
    "fonttext", "copy-font", "save-png", "save-status", "decrypt-buttons", "decrypt-grid-plain", "decrypt-grid-flag",
    "decrypt-image-line", "cipher-paste", "decode-paste", "decrypt-output", "modal", "modal-img", "modal-close"
  ];
  for (const id of ids) assert.equal([...html.matchAll(new RegExp(`id="${id}"`, "g"))].length, 1, id);
  assert.match(html, /<dialog id="modal"[^>]*aria-label=/);
  assert.doesNotMatch(html.match(/<img id="modal-img"[^>]*>/)[0], /\bsrc=/);
  for (const [role, count] of [["tablist", 1], ["tab", 3], ["tabpanel", 3]]) {
    assert.equal([...html.matchAll(new RegExp(`role="${role}"`, "g"))].length, count);
  }
  for (const match of html.matchAll(/<button[^>]*role="tab"[^>]*>/g)) {
    assert.match(match[0], /data-tab=/);
    assert.match(match[0], /aria-controls=/);
    assert.match(match[0], /aria-selected=/);
    assert.match(match[0], /tabindex="(?:0|-1)"/);
  }
  for (const match of html.matchAll(/<textarea\b[^>]*>/g)) {
    assert.match(match[0], /maxlength="(?:2000|20000)"/);
    assert.match(match[0], /spellcheck="false"/);
  }
  assert.match(html, /id="validation-feedback"[^>]*role="status"/);
  assert.match(html, /id="save-status"[^>]*role="status"/);
  assert.doesNotMatch(html, /\u{1F3F1}/u);
});
