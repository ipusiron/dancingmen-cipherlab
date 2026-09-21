// script.js

const logic = DancingMenLogic;
const t = (key, values) => DancingMenMessages.format(DancingMenMessages.DEFAULT_LANG, key, values);
let compositionCommitValue = null;
let encryptedLines = [[]];
let decryptionLines = [[]];
let modalTrigger = null;
const exportImages = new Map();
const EXPORT_SCALE = 2;

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  document.querySelector("#table-panel .key-table").addEventListener("click", event => {
    const button = event.target.closest(".figure-zoom");
    if (!button) return;
    modalTrigger = button;
    const modalImg = document.getElementById("modal-img");
    modalImg.src = button.querySelector("img").src;
    modalImg.alt = button.getAttribute("aria-label");
    modal.showModal();
  });
  modal.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });
  modal.addEventListener("close", () => modalTrigger?.focus());
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.querySelector(".tab-menu").addEventListener("click", event => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) switchTab(tab.dataset.tab);
  });
  document.querySelector(".tab-menu").addEventListener("keydown", handleTabKey);
  generateDecryptButtons();
  generateTable();
  document.getElementById("decrypt-buttons").addEventListener("click", event => {
    const button = event.target.closest("button[data-char]");
    if (button) appendDecryption(button.dataset.char, button.dataset.flag === "true");
  });
  document.getElementById("decrypt-clear").addEventListener("click", clearDecryption);
  document.getElementById("decrypt-delete").addEventListener("click", removeLastDecryption);
  document.getElementById("copy-decryption").addEventListener("click", copyDecryption);
  document.getElementById("decode-paste").addEventListener("click", decodePaste);
  const plaintext = document.getElementById("plaintext");
  plaintext.addEventListener("input", event => {
    if (event.isComposing) return;
    const duplicateCommit = compositionCommitValue === plaintext.value;
    compositionCommitValue = null;
    if (!duplicateCommit) encrypt();
  });
  plaintext.addEventListener("compositionend", () => {
    encrypt();
    compositionCommitValue = plaintext.value;
  });
  document.getElementById("encrypt-button").addEventListener("click", encrypt);
  generateSamples();
  document.getElementById("sample-load").addEventListener("click", () => {
    const id = document.getElementById("sample-select").value;
    plaintext.value = id === "all" ? logic.allSamplesText() : logic.SAMPLES.find(sample => sample.id === id).text;
    encrypt();
  });
  document.getElementById("copy-font").addEventListener("click", copyFontText);
  document.getElementById("save-png").addEventListener("click", savePng);
});

function closeModal() {
  document.getElementById("modal").close();
}

function switchTab(tabName) {
  const panels = document.querySelectorAll(".tab-panel");
  const buttons = document.querySelectorAll(".tab-button");

  panels.forEach(panel => {
    const selected = panel.id === `${tabName}-panel`;
    panel.classList.toggle("active", selected);
    panel.hidden = !selected;
  });
  buttons.forEach(button => {
    const selected = button.dataset.tab === tabName;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  document.querySelector(`[data-tab="${tabName}"]`).focus();
}

function handleTabKey(event) {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const index = tabs.indexOf(event.target);
  if (index < 0) return;
  let next;
  if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
  if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
  if (event.key === "Home") next = 0;
  if (event.key === "End") next = tabs.length - 1;
  if (next !== undefined) {
    event.preventDefault();
    switchTab(tabs[next].dataset.tab);
  }
}

function showValidationFeedback(validationResult) {
  const feedbackElement = document.getElementById('validation-feedback');
  const items = logic.feedbackItems(validationResult);
  feedbackElement.textContent = items.map(item => t(item.key, item.values)).join(t("feedback.separator"));
  feedbackElement.classList.toggle("show", items.length > 0);
}

function encrypt() {
  const plaintext = document.getElementById("plaintext");
  const rawInput = plaintext.value;
  const caret = plaintext.selectionStart;
  const outputArea = document.getElementById("output");
  const validationResult = logic.sanitizeInput(rawInput);

  // 正規化した分だけキャレットの位置を補正する。
  if (rawInput !== validationResult.text) {
    plaintext.value = validationResult.text;
    const nextCaret = logic.caretAfterSanitize(rawInput, caret);
    plaintext.setSelectionRange(nextCaret, nextCaret);
  }
  showValidationFeedback(validationResult);
  const lines = logic.encryptText(validationResult.text);
  encryptedLines = lines;
  document.getElementById("char-count").textContent = t("encrypt.count", { count: logic.countLetters(lines) });
  document.getElementById("ciphertext").textContent = logic.toFileNameText(lines);
  document.getElementById("fonttext").textContent = logic.toFontText(lines);
  document.getElementById("font-copy-status").textContent = "";
  document.getElementById("save-status").textContent = "";
  document.getElementById("save-png").disabled = logic.countLetters(lines) === 0;
  renderFigures(outputArea, lines);
}

function renderFigures(container, lines) {
  container.replaceChildren();
  for (const line of lines) {
    const lineDiv = document.createElement("div");
    lineDiv.className = "svg-line";
    if (!line.length) lineDiv.classList.add("is-blank");
    container.appendChild(lineDiv);
    for (const token of line) {
      const img = document.createElement("img");
      img.src = "assets/svg/full/" + logic.tokenFileName(token);
      img.alt = token.flag ? t("figure.flag", { letter: token.letter }) : t("figure.letter", { letter: token.letter });
      img.title = img.alt;
      lineDiv.appendChild(img);
    }
  }
}

async function exportImage(name) {
  if (!exportImages.has(name)) {
    const img = new Image();
    img.src = "assets/svg/full/" + name;
    exportImages.set(name, img.decode().then(() => img).catch(error => {
      exportImages.delete(name);
      throw error;
    }));
  }
  return exportImages.get(name);
}

async function savePng() {
  const status = document.getElementById("save-status");
  const layout = logic.layoutCipher(encryptedLines);
  if (!layout.figures.length) return;
  if (layout.width > 8000 || layout.height > 8000) {
    status.textContent = t("save.tooLarge");
    return;
  }
  if (location.protocol === "file:") {
    status.textContent = t("save.unavailable");
    return;
  }
  let url;
  try {
    const names = [...new Set(layout.figures.map(figure => figure.name))];
    const images = new Map(await Promise.all(names.map(async name => [name, await exportImage(name)])));
    const canvas = document.createElement("canvas");
    canvas.width = layout.width * EXPORT_SCALE;
    canvas.height = layout.height * EXPORT_SCALE;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = "multiply";
    for (const figure of layout.figures) {
      context.drawImage(images.get(figure.name), figure.x * EXPORT_SCALE, figure.y * EXPORT_SCALE,
        figure.w * EXPORT_SCALE, figure.h * EXPORT_SCALE);
    }
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Empty PNG");
    url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dancingmen-cipher.png";
    link.click();
    status.textContent = t("save.success");
  } catch {
    status.textContent = t("save.unavailable");
  } finally {
    if (url) URL.revokeObjectURL(url);
  }
}

function generateSamples() {
  const select = document.getElementById("sample-select");
  logic.SAMPLES.forEach((sample, index) => {
    const option = document.createElement("option");
    option.value = sample.id;
    const text = sample.text.split("\n").join(t("sample.lineSeparator"));
    option.textContent = t("sample.label", { number: index + 1, text }) +
      (sample.text.includes("\n") ? t("sample.multiline") : "");
    select.appendChild(option);
  });
  const all = document.createElement("option");
  all.value = "all";
  all.textContent = t("sample.all", { count: logic.SAMPLES.length });
  select.appendChild(all);
}

async function copyFontText() {
  await copyText(document.getElementById("fonttext").textContent,
    document.getElementById("font-copy-status"), t("copy.fontSuccess"));
}

async function copyText(text, status, success) {
  status.textContent = "";
  try {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(text);
    status.textContent = success;
  } catch {
    status.textContent = t("copy.failure");
  }
}

function generateTable() {
  const container = document.querySelector("#table-panel .key-table");
  if (!container) return;
  const svgFolder = "assets/svg/padded/";
  for (const ch of logic.LETTERS) {
    const div = document.createElement("div");
    div.className = "key-entry";
    const label = document.createElement("div");
    label.className = "char-label";
    label.textContent = t("figure.letter", { letter: ch });
    div.appendChild(label);
    for (const flag of [false, true]) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "figure-zoom";
      const figure = flag ? t("figure.flag", { letter: ch }) : t("figure.plain", { letter: ch });
      button.setAttribute("aria-label", t("figure.zoom", { figure }));
      button.title = button.getAttribute("aria-label");
      const img = document.createElement("img");
      img.src = svgFolder + logic.tokenFileName({ letter: ch, flag });
      img.alt = "";
      button.appendChild(img);
      div.appendChild(button);
    }
    container.appendChild(div);
  }
}

function generateDecryptButtons() {
  for (const flag of [false, true]) {
    const container = document.getElementById(flag ? "decrypt-grid-flag" : "decrypt-grid-plain");
    for (const ch of logic.LETTERS) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "grid-cell";
      button.dataset.char = ch;
      button.dataset.flag = String(flag);
      button.setAttribute("aria-label", flag ? t("figure.flag", { letter: ch }) : t("figure.plain", { letter: ch }));
      const label = document.createElement("span");
      label.textContent = t("figure.letter", { letter: ch });
      const img = document.createElement("img");
      img.src = "assets/svg/padded/" + logic.tokenFileName({ letter: ch, flag });
      img.alt = "";
      button.append(label, img);
      container.appendChild(button);
    }
  }
}

function appendDecryption(char, flag) {
  if (logic.countLetters(decryptionLines) >= logic.MAX_INPUT_LENGTH) {
    document.getElementById("decode-status").textContent = t("decode.tooLong", { max: "2,000" });
    return;
  }
  decryptionLines.at(-1).push({ letter: char, flag });
  updateDecryption();
}

function updateDecryption() {
  renderFigures(document.getElementById("decrypt-image-line"), decryptionLines);
  document.getElementById("decrypt-output").textContent = logic.decodeTokens(decryptionLines);
  document.getElementById("copy-toast").textContent = "";
  document.getElementById("decode-status").textContent = "";
}

function decodePaste() {
  const parsed = logic.parseCipherText(document.getElementById("cipher-paste").value);
  const status = document.getElementById("decode-status");
  if (logic.countLetters(parsed.lines) > logic.MAX_INPUT_LENGTH) {
    status.textContent = t("decode.tooLong", { max: "2,000" });
    return;
  }
  decryptionLines = parsed.lines;
  updateDecryption();
  if (parsed.invalid.length) {
    status.textContent = t("decode.invalid", { chars: parsed.invalid.slice(0, 10) }) +
      (parsed.invalid.length > 10 ? t("decode.more", { count: parsed.invalid.length - 10 }) : "");
  }
}

function clearDecryption() {
  decryptionLines = [[]];
  document.getElementById("cipher-paste").value = "";
  updateDecryption();
}

function removeLastDecryption() {
  if (!decryptionLines.at(-1).length && decryptionLines.length > 1) decryptionLines.pop();
  else decryptionLines.at(-1).pop();
  updateDecryption();
}

function copyDecryption() {
  return copyText(logic.decodeTokens(decryptionLines), document.getElementById("copy-toast"), t("copy.decryptSuccess"));
}
