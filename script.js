function switchTab(tabName) {
  const panels = document.querySelectorAll(".tab-panel");
  const buttons = document.querySelectorAll(".tab-button");

  panels.forEach(panel => panel.classList.remove("active"));
  buttons.forEach(btn => btn.classList.remove("active"));

  document.getElementById(`${tabName}-panel`).classList.add("active");
  document.querySelector(`.tab-button[onclick="switchTab('${tabName}')"]`).classList.add("active");
}

function encrypt() {
  const svgFolder = "assets/svg/tight/";

  const input = document.getElementById("plaintext").value;
  const outputArea = document.getElementById("output");
  const textArea = document.getElementById("ciphertext");
  outputArea.innerHTML = "";
  textArea.textContent = "";

  const lines = input.split(/\r?\n/);
  let cipherText = "";

  for (const line of lines) {
    const letters = line.toUpperCase().split("");

    // 🔸 行ごとにdivを作成して画像をまとめる
    const lineDiv = document.createElement("div");
    lineDiv.className = "svg-line";
    outputArea.appendChild(lineDiv);

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
        lineDiv.appendChild(img);

        cipherText += filename + " ";
      }
    }

    cipherText += "\n";
  }

  textArea.textContent = cipherText.trim();
}
