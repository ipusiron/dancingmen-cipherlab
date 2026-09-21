const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const css = fs.readFileSync(path.join(__dirname, "../style.css"), "utf8");
const root = css.match(/:root\s*\{([^}]+)\}/)[1];
const colors = Object.fromEntries([...root.matchAll(/--color-([\w-]+):\s*(#[a-f\d]{6});/gi)]
  .map(match => [match[1], match[2]]));

function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map(part => parseInt(part, 16) / 255)
    .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

test("all G-2 text and surface pairs meet WCAG contrast thresholds", () => {
  const pairs = [
    ["text", "bg"], ["header-text", "header-bg"], ["tab-text", "tab-bg"], ["tab-text", "tab-hover-bg"],
    ["tab-active-text", "tab-active-bg"], ["button-text", "button-bg"], ["button-text", "button-hover-bg"],
    ["accent", "bg"], ["accent", "footer-bg"], ["muted", "bg"], ["text", "code-bg"],
    ["success-text", "success-bg"], ["warning-text", "warning-bg"], ["error-text", "error-bg"],
    ["text", "paper"], ["border-strong", "bg", 3]
  ];
  for (const [foreground, background, minimum = 4.5] of pairs) {
    assert.ok(colors[foreground] && colors[background]);
    const a = luminance(colors[foreground]);
    const b = luminance(colors[background]);
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    assert.ok(ratio >= minimum, `${foreground} on ${background}: ${ratio}`);
  }
});
