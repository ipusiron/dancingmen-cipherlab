// 🔁 タブ切り替え処理
function switchTab(tabName) {
  const panels = document.querySelectorAll(".tab-panel");
  const buttons = document.querySelectorAll(".tab-button");

  panels.forEach(panel => {
    panel.classList.remove("active");
  });
  buttons.forEach(btn => {
    btn.classList.remove("active");
  });

  document.getElementById(`${tabName}-panel`).classList.add("active");
  document.querySelector(`.tab-button[onclick="switchTab('${tabName}')"]`).classList.add("active");
}

// 🔐 暗号化処理（テキスト → SVG人形）
function encrypt() {
  const input = document.getElementById("plaintext").value.toUpperCase();
  const outputArea = document.getElementById("output");
  outputArea.innerHTML = "";

  const letters = input.split("");
  for (let i = 0; i < letters.length; i++) {
    const char = letters[i];
    if (char >= 'A' && char <= 'Z') {
      // 次が空白なら旗付き
      const next = letters[i + 1];
      const withFlag = (next === " ");
      const filename = withFlag ? `${char}f.svg` : `${char}.svg`;
      const img = document.createElement("img");
      img.src = `assets/svg/${filename}`;
      img.alt = char;
      outputArea.appendChild(img);
    } else if (char === " ") {
      // スペースは何も出力しない（旗付きで表現済）
      continue;
    }
  }
}
