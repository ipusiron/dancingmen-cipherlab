// script.js

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

function validateAndSanitizeInput(input) {
  // 許可する文字: A-Z, a-z, スペース、改行
  const allowedPattern = /[^A-Za-z\s\n\r]/g;
  const invalidChars = input.match(allowedPattern);
  
  // 無効な文字を削除
  const sanitized = input.replace(allowedPattern, '');
  
  return {
    sanitized: sanitized,
    hasInvalidChars: invalidChars !== null,
    invalidChars: invalidChars ? [...new Set(invalidChars)] : [],
    validCharCount: sanitized.replace(/[\s\n\r]/g, '').length
  };
}

function showValidationFeedback(validationResult) {
  const feedbackElement = document.getElementById('validation-feedback');
  const charCountElement = document.getElementById('char-count');
  
  if (!feedbackElement || !charCountElement) return;
  
  // 文字数の更新
  charCountElement.textContent = `暗号化可能文字数: ${validationResult.validCharCount}`;
  
  // エラーメッセージの表示/非表示
  if (validationResult.hasInvalidChars) {
    feedbackElement.textContent = `無効な文字が削除されました: ${validationResult.invalidChars.join(', ')}`;
    feedbackElement.style.display = 'block';
    feedbackElement.classList.add('show');
    
    // 3秒後にフェードアウト
    setTimeout(() => {
      feedbackElement.classList.remove('show');
      setTimeout(() => {
        feedbackElement.style.display = 'none';
      }, 300);
    }, 3000);
  }
}

function encrypt() {
  const svgFolder = "assets/svg/tight/";
  const rawInput = document.getElementById("plaintext").value;
  const outputArea = document.getElementById("output");
  const textArea = document.getElementById("ciphertext");
  
  // 入力をバリデーション
  const validationResult = validateAndSanitizeInput(rawInput);
  const input = validationResult.sanitized;
  
  // バリデーション結果を表示
  showValidationFeedback(validationResult);
  
  // 元の入力と異なる場合は、サニタイズされた値で更新
  if (rawInput !== input) {
    document.getElementById("plaintext").value = input;
  }
  
  outputArea.innerHTML = "";
  textArea.textContent = "";

  const lines = input.split(/\r?\n/);
  let cipherText = "";

  for (const line of lines) {
    const letters = line.split("");
    const lineDiv = document.createElement("div");
    lineDiv.className = "svg-line";
    outputArea.appendChild(lineDiv);

    for (let i = 0; i < letters.length; i++) {
      const char = letters[i];
      const upperChar = char.toUpperCase();
      if ((char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z')) {
        const next = letters[i + 1];
        const useFlag = (next === " ");
        const filename = useFlag ? `${upperChar}f.svg` : `${upperChar}.svg`;

        const img = document.createElement("img");
        img.src = `${svgFolder}${filename}`;
        img.alt = upperChar;
        img.title = char + (useFlag ? " (旗あり)" : "");
        lineDiv.appendChild(img);

        cipherText += filename + " ";
      }
    }
    cipherText += "\n";
  }
  textArea.textContent = cipherText.trim();
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
  const svgFolder = "assets/svg/tight/";
  const filename = flag ? `${char}f.svg` : `${char}.svg`;

  const img = document.createElement("img");
  img.src = `${svgFolder}${filename}`;
  img.alt = char;
  document.getElementById("decrypt-image-line").appendChild(img);

  const output = document.getElementById("decrypt-output");
  output.textContent += char + (flag ? " " : "");
}

function clearDecryption() {
  document.getElementById("decrypt-image-line").innerHTML = "";
  document.getElementById("decrypt-output").textContent = "";
}

function removeLastDecryption() {
  const imageLine = document.getElementById("decrypt-image-line");
  const output = document.getElementById("decrypt-output");
  if (imageLine.lastChild) imageLine.removeChild(imageLine.lastChild);

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
