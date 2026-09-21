# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

DancingMen CipherLab is a web-based tool that implements the classical substitution cipher from Arthur Conan Doyle's Sherlock Holmes story "The Dancing Men". The project is a pure client-side web application with no build process required.

## Development Commands

This project uses static HTML, CSS, and classic JavaScript. No build, npm install, or external dependencies are required.

- **To run locally**: Simply open `index.html` in a web browser
- **No dependencies**: No npm install, no build process, no external libraries
- **Deployment**: Direct deployment to GitHub Pages (static hosting)
- **Tests**: `npm test` (Node.js 22 or later, built-in `node --test`); CI runs on push and pull_request
- **SVG check**: `node tools/build-full-svg.js --check` (no writes)
- **SVG regeneration**: `node tools/build-full-svg.js` (writes only assets/svg/full/)
- **Local HTTP**: `python -m http.server 8000 --bind 127.0.0.1`, then open http://127.0.0.1:8000/

## Architecture Overview

### Core Components

1. **index.html**: Single-page application with three tabs (Encryption, Decryption, Substitution Table)
2. **script.js**: Input events, tabs, shared figure rendering, PNG export, decryption state, and native dialog
3. **style.css**: Styling and responsive design
4. **assets/svg/**: Dancing figure SVG images in three variants (52 files each, 156 total):
   - `tight/`: Immutable source for full SVG generation
   - `padded/`: With margins for individual character examination
   - `full/`: Generated root viewBox expansion, used by both text displays and PNG export
5. **dancingmen-logic.js**: DOM-independent functions, exposed through globalThis.DancingMenLogic and CommonJS
6. **dancingmen-messages.js**: Japanese dictionary and formatter, exposed through globalThis and CommonJS
7. **test/**: Logic, samples, SVG integrity, layout, messages, HTML, contrast, formatting, static code, and README tests
8. **tools/build-full-svg.js**: Dependency-free Node generator, not used by the browser

### Key Architectural Decisions

1. **Flag rules**: A letter is flagged when its immediate next character is an ASCII space, or when it is the last character
   of a line and the immediately following line contains a letter. Empty or space-only lines separate messages.

2. **SVG Strategy**: Keep the original 104 tight/padded assets byte-for-byte unchanged:
   - Full version expands the tight viewBox by 5pt horizontally and 2pt vertically, without changing other SVG content
   - Natural pt sizing, negative 5pt inline margins, flex-end alignment, and multiply blending preserve scale and advances
   - Padded version for character reference and selection
   - Do not edit full files manually; regenerate them with the Node tool

3. **Pure Client-Side**: No backend, no API calls, no external dependencies. All cipher logic is contained within the browser.

4. **Event-Driven UI**: No inline handlers or styles. Decryption uses a token-line array rather than reading state from the DOM.
   Tabs use roving tabindex and ArrowLeft/ArrowRight/Home/End without hard-coding the number of tabs.
   The substitution table is built once. Only its buttons open the native dialog; Escape and close restore focus.

### Cipher Implementation

The cipher follows these rules:
- Each letter A-Z maps to a specific dancing figure
- Flagged versions use the 'f' suffix, following the two rules above
- Each SVG variant has 52 files (26 letters × 2 states)
- Font notation uses lowercase for unflagged letters and uppercase for flagged letters
- File-name notation accepts A.svg through Z.svg and Af.svg through Zf.svg
- Serializers trim outer blank rows and do not leave trailing spaces; internal blank rows remain
- Six original samples contain 76 letters over 12 rows when separated by blank rows
- Sample 6 has no trailing space; append one space to reproduce the source's final flagged E

Key functions:
- `sanitizeInput()`: Normalize CRLF/CR, fullwidth Latin letters, and whitespace; remove unsupported code points; cap at 2,000
- `caretAfterSanitize()`: Restore the caret using the sanitized prefix length
- `encryptText()`, `toFontText()`, `toFileNameText()`: Produce token lines and both notations
- `parseCipherText()`, `decodeTokens()`: Parse either notation and produce uppercase plaintext
- `renderFigures()`: Shared full-SVG renderer for encryption and decryption
- `layoutCipher()`: Logical PNG dimensions and figure coordinates
- `encrypt()`: UI processing; input events do nothing while isComposing, then compositionend processes committed text

### PNG Export and Browser Security

PNG export loads same-origin full SVG files with Image.decode(), caches each file in a Map, and draws them onto a white canvas
using multiply compositing at 2x scale. It rejects logical dimensions above 8,000px, saves toBlob output, and revokes the object URL.
No fetch or runtime SVG creation is used. file:// supports encryption, decryption, the table, and clipboard when permitted,
but PNG export deliberately shows the local-server guidance instead. Chromium on Windows has been verified; Firefox/Safari have not.
Clipboard absence or rejection is handled as a status message, without execCommand fallback.
Keep the meta CSP, no-referrer policy, and noopener noreferrer links. Meta CSP does not provide frame-ancestors protection.

### Japanese-First Design

The UI is Japanese. All dynamically displayed text, alt/title/aria labels, and messages must go through `t(key, values)`
and dancingmen-messages.js. The formatter rejects unknown keys and missing values. Do not add Japanese string literals to
script.js or dancingmen-logic.js. English dictionaries and a language switch are deferred to a later iteration.
Static HTML text may remain Japanese. Keep the README's sample/rule tables, file tree, and screenshots consistent with the code.
