// Pure cipher operations shared by classic scripts and Node tests.
const DancingMenLogic = (() => {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const MAX_INPUT_LENGTH = 2000;
  const FULL_PAD_X = 5;
  const FULL_PAD_Y = 2;
  const PX_PER_PT = 4 / 3;

  function sanitizeInput(raw) {
    let text = "";
    const removed = new Set();
    let replacedSpaces = 0;
    let replacedFullwidth = 0;
    for (const char of raw.replace(/\r\n?/g, "\n")) {
      if (/^[A-Za-z \n]$/.test(char)) {
        text += char;
      } else if (/^[\uFF21-\uFF3A\uFF41-\uFF5A]$/.test(char)) {
        text += String.fromCodePoint(char.codePointAt(0) - 0xFEE0);
        replacedFullwidth++;
      } else if (/\s/.test(char)) {
        text += " ";
        replacedSpaces++;
      } else {
        removed.add(char);
      }
    }
    const truncated = text.length > MAX_INPUT_LENGTH;
    return {
      text: text.slice(0, MAX_INPUT_LENGTH), removed: [...removed],
      replacedSpaces, replacedFullwidth, truncated
    };
  }

  function caretAfterSanitize(raw, caret) {
    return sanitizeInput(raw.slice(0, caret)).text.length;
  }

  function feedbackItems(result) {
    const items = [];
    if (result.removed.length) {
      items.push({ key: "feedback.removed", values: { chars: [...result.removed] } });
    }
    if (result.replacedFullwidth || result.replacedSpaces) {
      items.push({ key: "feedback.replaced", values: {} });
    }
    if (result.truncated) {
      items.push({ key: "feedback.truncated", values: { max: "2,000" } });
    }
    return items;
  }

  function encryptText(raw) {
    const rows = sanitizeInput(raw).text.split("\n");
    return rows.map((row, rowIndex) => {
      const tokens = [];
      for (let index = 0; index < row.length; index++) {
        const char = row[index];
        if (!/[A-Za-z]/.test(char)) continue;
        const flag = row[index + 1] === " " ||
          (index === row.length - 1 && /[A-Za-z]/.test(rows[rowIndex + 1] || ""));
        tokens.push({ letter: char.toUpperCase(), flag });
      }
      return tokens;
    });
  }

  function countLetters(lines) {
    return lines.reduce((total, row) => total + row.length, 0);
  }

  function trimEmptyRows(lines) {
    let first = 0;
    let last = lines.length;
    while (first < last && !lines[first].length) first++;
    while (last > first && !lines[last - 1].length) last--;
    return lines.slice(first, last);
  }

  function tokenFileName(token) {
    return `${token.letter}${token.flag ? "f" : ""}.svg`;
  }

  function toFileNameText(lines) {
    return trimEmptyRows(lines).map(row => row.map(tokenFileName).join(" ")).join("\n");
  }

  function textFromTokens(lines, font) {
    return trimEmptyRows(lines).map(row => row.map((token, index) => {
      const char = font && !token.flag ? token.letter.toLowerCase() : token.letter;
      return char + (token.flag && index < row.length - 1 ? " " : "");
    }).join("")).join("\n");
  }

  function toFontText(lines) {
    return textFromTokens(lines, true);
  }

  function decodeTokens(lines) {
    return textFromTokens(lines, false);
  }

  function normalizePlain(raw) {
    const rows = sanitizeInput(raw).text.toUpperCase().split("\n")
      .map(row => row.replace(/ +/g, " ").trim());
    return trimEmptyRows(rows).join("\n");
  }

  function parseCipherText(raw) {
    const notation = /\.svg/i.test(raw) ? "filenames" : "font";
    const invalid = new Set();
    const lines = raw.replace(/\r\n?/g, "\n").split("\n").map(row => {
      const tokens = [];
      if (notation === "filenames") {
        for (const word of row.split(/\s+/).filter(Boolean)) {
          const match = /^([A-Za-z])(f?)\.svg$/.exec(word);
          if (match) tokens.push({ letter: match[1].toUpperCase(), flag: Boolean(match[2]) });
          else invalid.add(word);
        }
      } else {
        for (const char of row) {
          if (/[A-Za-z]/.test(char)) {
            tokens.push({ letter: char.toUpperCase(), flag: /[A-Z]/.test(char) });
          } else if (!/\s/.test(char)) {
            invalid.add(char);
          }
        }
      }
      return tokens;
    });
    return { lines, invalid: [...invalid], notation };
  }

  const flagHeights = [
    43.965, 43.2, 40.9425, 43.485, 42.0975, 41.6175, 42.0975, 44.445, 44.445,
    44.445, 42.0975, 41.2275, 39.5475, 39.5475, 42.0975, 46.0275, 45.5475,
    43.965, 40.7025, 43.485, 40.9425, 46.0275, 45.5475, 39.5475, 39.5475, 40.9425
  ];
  const TIGHT_VIEWBOX = {};
  [...LETTERS].forEach((letter, index) => {
    TIGHT_VIEWBOX[letter] = Object.freeze([28.8, 38.9775]);
    const width = letter === "I" ? 31.8225 : letter === "M" ? 28.845 : 28.8;
    TIGHT_VIEWBOX[`${letter}f`] = Object.freeze([width, flagHeights[index]]);
  });
  Object.freeze(TIGHT_VIEWBOX);

  function figureSize(token) {
    const [width, height] = TIGHT_VIEWBOX[tokenFileName(token).replace(".svg", "")];
    return {
      width: (width + 2 * FULL_PAD_X) * PX_PER_PT,
      height: (height + 2 * FULL_PAD_Y) * PX_PER_PT,
      advance: width * PX_PER_PT
    };
  }

  function expandSvgViewBox(svgText, padX = FULL_PAD_X, padY = FULL_PAD_Y) {
    return svgText.replace(/<svg\b[^>]*>/, tag => {
      const viewBox = /\bviewBox="([^"]+)"/.exec(tag);
      if (!viewBox) throw new Error("Missing root viewBox");
      const [, , width, height] = viewBox[1].split(/\s+/).map(Number);
      const round = value => Number(value.toFixed(4));
      const expandedWidth = round(width + 2 * padX);
      const expandedHeight = round(height + 2 * padY);
      return tag.replace(/\bwidth="[^"]*"/, `width="${expandedWidth}pt"`)
        .replace(/\bheight="[^"]*"/, `height="${expandedHeight}pt"`)
        .replace(/\bviewBox="[^"]*"/, `viewBox="${-padX} ${-padY} ${expandedWidth} ${expandedHeight}"`);
    });
  }

  function layoutCipher(lines) {
    const MARGIN = 16;
    const LINE_GAP = 12;
    const BLANK_ROW_HEIGHT = 24;
    const ROW_HEIGHT = (46.0275 + 2 * FULL_PAD_Y) * PX_PER_PT;
    const rows = trimEmptyRows(lines);
    const figures = [];
    const round = value => Number(value.toFixed(2));
    let top = MARGIN;
    let bottom = MARGIN;
    let longest = 0;
    for (const row of rows) {
      bottom = top + (row.length ? ROW_HEIGHT : BLANK_ROW_HEIGHT);
      let x = MARGIN;
      for (const token of row) {
        const size = figureSize(token);
        figures.push({
          name: tokenFileName(token), x: round(x), y: round(bottom - size.height),
          w: round(size.width), h: round(size.height)
        });
        x += size.advance;
      }
      longest = Math.max(longest, x - MARGIN);
      top = bottom + LINE_GAP;
    }
    return {
      width: Math.ceil(longest + 2 * FULL_PAD_X * PX_PER_PT + 2 * MARGIN),
      height: Math.ceil(bottom + MARGIN), rows: rows.length, figures
    };
  }

  const SAMPLES = Object.freeze([
    { id: "m1", text: "AM HERE ABE SLANEY" },
    { id: "m2", text: "AT ELRIGES" },
    { id: "m3", text: "COME ELSIE" },
    { id: "m4", text: "NEVER" },
    { id: "m5", text: "ELSIE PREPARE TO\nMEET THY GOD" },
    { id: "m6", text: "COME HERE AT ONCE" }
  ].map(Object.freeze));

  function allSamplesText() {
    return SAMPLES.map(sample => sample.text).join("\n\n");
  }

  return {
    LETTERS, MAX_INPUT_LENGTH, sanitizeInput, caretAfterSanitize, feedbackItems,
    encryptText, tokenFileName, toFileNameText, toFontText, parseCipherText,
    decodeTokens, normalizePlain, countLetters, TIGHT_VIEWBOX, FULL_PAD_X,
    FULL_PAD_Y, PX_PER_PT, figureSize, expandSvgViewBox, layoutCipher, SAMPLES, allSamplesText
  };
})();

globalThis.DancingMenLogic = DancingMenLogic;
if (typeof module === "object" && module.exports) {
  module.exports = DancingMenLogic;
}
