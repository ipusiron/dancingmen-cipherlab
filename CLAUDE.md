# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

DancingMen CipherLab is a web-based tool that implements the classical substitution cipher from Arthur Conan Doyle's Sherlock Holmes story "The Dancing Men". The project is a pure client-side web application with no build process required.

## Development Commands

This project has **no build, test, or lint commands**. It consists of static HTML, CSS, and JavaScript files that can be opened directly in a browser.

- **To run locally**: Simply open `index.html` in a web browser
- **No dependencies**: No npm install, no build process, no external libraries
- **Deployment**: Direct deployment to GitHub Pages (static hosting)

## Architecture Overview

### Core Components

1. **index.html**: Single-page application with three tabs (Encryption, Decryption, Substitution Table)
2. **script.js**: All cipher logic and UI interactions (~180 lines)
3. **style.css**: Styling and responsive design
4. **assets/svg/**: Dancing figure SVG images in two variants:
   - `tight/`: Minimal spacing for text display
   - `padded/`: With margins for individual character examination

### Key Architectural Decisions

1. **Space Encoding**: Spaces are represented by "flagged" characters (e.g., `Af.svg` indicates 'A' followed by a space). This preserves word boundaries while maintaining visual continuity.

2. **Dual SVG Strategy**: Two SVG variants serve different purposes:
   - Tight version for continuous text display
   - Padded version for character reference and selection

3. **Pure Client-Side**: No backend, no API calls, no external dependencies. All cipher logic is contained within the browser.

4. **Event-Driven UI**: Tab switching and modal functionality use event delegation for efficiency.

### Cipher Implementation

The cipher follows these rules:
- Each letter A-Z maps to a specific dancing figure
- Flagged versions (with 'f' suffix) indicate the character is followed by a space
- Total of 52 SVG files (26 letters × 2 states)

Key functions:
- `encrypt()`: Converts plaintext to dancing figures (script.js:76-104)
- `appendDecryption()`: Builds decrypted text from clicked figures (script.js:123-141)
- Modal system for image zooming (script.js:15-30)

### Japanese-First Design

The UI is primarily in Japanese, targeting Japanese Sherlock Holmes enthusiasts while maintaining international accessibility through the visual cipher system.