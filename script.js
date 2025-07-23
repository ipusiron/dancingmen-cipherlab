document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    if (e.target.matches(".key-entry img")) {
      const modal = document.getElementById("modal");
      const modalImg = document.getElementById("modal-img");
      modalImg.src = e.target.src;
      modalImg.alt = e.target.alt;

      modalImg.removeAttribute("width");
      modalImg.removeAttribute("height");

      // 明示的にクラス追加してスタイルを強制
      modalImg.className = "modal-img zoomed";

      modal.classList.add("show");
    }
  });
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

  if (tabName === "table") {
    generateTable();
  }
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
