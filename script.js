// script.js

const logic = DancingMenLogic;
const t = (key, values) => DancingMenMessages.format(DancingMenMessages.DEFAULT_LANG, key, values);
let compositionCommitValue = null;
let encryptedLines = [[]];
const decryptionFigures = [];
const exportImages = new Map();
const EXPORT_SCALE = 2;

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    if (e.target.matches(".key-entry img")) {
      const modal = document.getElementById("modal");
      const modalImg = document.getElementById("modal-img");
      modalImg.src = e.target.src;
      modalImg.alt = e.target.alt;
      modalImg.removeAttribute("width");
      modalImg.removeAttribute("height");
      modalImg.className = "modal-img zoomed";
      modal.classList.add("show");
    }
  });

  generateDecryptButtons();
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
  document.getElementById("modal").classList.remove("show");
}

function switchTab(tabName) {
  const panels = document.querySelectorAll(".tab-panel");
  const buttons = document.querySelectorAll(".tab-button");

  panels.forEach(panel => panel.classList.remove("active"));
  buttons.forEach(btn => btn.classList.remove("active"));

  document.getElementById(`${tabName}-panel`).classList.add("active");
  document.querySelector(`.tab-button[onclick="switchTab('${tabName}')"]`).classList.add("active");

  if (tabName === "table") generateTable();
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
  const status = document.getElementById("font-copy-status");
  try {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(document.getElementById("fonttext").textContent);
    status.textContent = t("copy.fontSuccess");
  } catch {
    status.textContent = t("copy.failure");
  }
}

function generateTable() {
  const container = document.querySelector(".key-table");
  if (!container) return;
  const svgFolder = "assets/svg/padded/";
  container.innerHTML = "";
  for (let i = 0; i < 26; i++) {
    const ch = String.fromCharCode(65 + i);
    const div = document.createElement("div");
    div.className = "key-entry";
    div.innerHTML = `
      <div class="char-label">${ch}</div>
      <img src="${svgFolder}${ch}.svg" alt="${ch}" title="${ch}">
      <img src="${svgFolder}${ch}f.svg" alt="${ch}f" title="${ch} (旗あり)">
    `;
    container.appendChild(div);
  }
}

function generateDecryptButtons() {
  const container = document.getElementById("decrypt-buttons");
  if (!container) return;

  container.innerHTML = "";
  container.className = "decrypt-grid"; // ここが重要！

  // 上段：a〜z（旗なし）
  for (let i = 0; i < 26; i++) {
    const ch = String.fromCharCode(65 + i);
    const div = document.createElement("div");
    div.className = "grid-cell";
    div.innerHTML = `
      <div>${ch}</div>
      <img src="assets/svg/padded/${ch}.svg" data-char="${ch}" data-flag="false">
    `;
    container.appendChild(div);
  }

  // 下段：a〜z（旗あり）
  for (let i = 0; i < 26; i++) {
    const ch = String.fromCharCode(65 + i);
    const div = document.createElement("div");
    div.className = "grid-cell";
    div.innerHTML = `
      <div>${ch}</div>
      <img src="assets/svg/padded/${ch}f.svg" data-char="${ch}" data-flag="true">
    `;
    container.appendChild(div);
  }

  // イベント登録（共通処理）
  container.querySelectorAll("img").forEach(img => {
    img.addEventListener("click", () => {
      const char = img.dataset.char;
      const flag = img.dataset.flag === "true";
      appendDecryption(char, flag);
    });
  });
}

function appendDecryption(char, flag) {
  decryptionFigures.push({ letter: char, flag });
  renderFigures(document.getElementById("decrypt-image-line"), [decryptionFigures]);

  const output = document.getElementById("decrypt-output");
  output.textContent += char + (flag ? " " : "");
}

function clearDecryption() {
  decryptionFigures.length = 0;
  renderFigures(document.getElementById("decrypt-image-line"), [decryptionFigures]);
  document.getElementById("decrypt-output").textContent = "";
}

function removeLastDecryption() {
  const output = document.getElementById("decrypt-output");
  decryptionFigures.pop();
  renderFigures(document.getElementById("decrypt-image-line"), [decryptionFigures]);

  // 現在の出力を取得
  let current = output.textContent;

  // 末尾が空白なら空白 + 直前の1文字削除、そうでなければ1文字だけ削除
  if (current.endsWith(" ")) {
    output.textContent = current.slice(0, -2);
  } else {
    output.textContent = current.slice(0, -1);
  }
}

function copyDecryption() {
  const outputText = document.getElementById("decrypt-output").textContent;
  navigator.clipboard.writeText(outputText).then(() => {
    const toast = document.getElementById("copy-toast");
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  });
}
