function switchTab(tabName) {
  const panels = document.querySelectorAll(".tab-panel");
  const buttons = document.querySelectorAll(".tab-button");

  panels.forEach(panel => panel.classList.remove("active"));
  buttons.forEach(btn => btn.classList.remove("active"));

  document.getElementById(`${tabName}-panel`).classList.add("active");
  document.querySelector(`.tab-button[onclick="switchTab('${tabName}')"]`).classList.add("active");
}

function encrypt() {
  // 読み込み元フォルダ（tight版を使う場合はこちらを指定）
  const svgFolder = "assets/svg/tight/";  // ← assets/svg/padded/ に切り替えることも可

  const input = document.getElementById("plaintext").value;
  const outputArea = document.getElementById("output");
  const textArea = document.getElementById("ciphertext");
  outputArea.innerHTML = "";
  textArea.textContent = "";

  const lines = input.split(/\r?\n/); // 改行で分割（Windowsにも対応）
  let cipherText = "";

  for (const line of lines) {
    const letters = line.toUpperCase().split("");

    for (let i = 0; i < letters.length; i++) {
      const char = letters[i];

      if (char >= 'A' && char <= 'Z') {
        const next = letters[i + 1];
        const useFlag = (next === " ");
        const filename = useFlag ? `${char}f.svg` : `${char}.svg`;

        const img = document.createElement("img");
        img.src = `${svgFolder}${filename}`;
        img.alt = char;
        img.title = char + (useFlag ? " (旗あり)" : "");
        outputArea.appendChild(img);

        cipherText += filename + " ";
      }
    }

    // 改行処理（SVG表示も暗号文も）
    outputArea.appendChild(document.createElement("br"));
    cipherText += "\n";
  }

  textArea.textContent = cipherText.trim();
}

