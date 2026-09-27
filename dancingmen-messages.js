// UI-independent messages. Additional languages can share the same keys.
const DancingMenMessages = (() => {
  const DEFAULT_LANG = "ja";
  const LANGUAGES = ["ja", "en"];
  const dictionaries = {
    ja: {
      "list.open": "「",
      "list.close": "」",
      "app.title": "DancingMen CipherLab - ドイルの踊る人形暗号ツール",
      "app.description": "シャーロック・ホームズの「踊る人形」暗号を体験できるツールです。",
      "app.langButton": "English",
      "app.langAria": "言語を切り替える",
      "tabs.aria": "暗号化・復号・置換表",
      "tab.encrypt": "🔐 暗号化",
      "tab.decrypt": "🔓 復号",
      "tab.table": "📓 置換表",
      "encrypt.inputLabel": "平文を入力してください（A〜Zとスペース、改行）",
      "encrypt.placeholder": "HELLO WORLD のように入力",
      "encrypt.hint": "A〜Zとスペース、改行が使えます。全角の英字とスペースは半角に置き換えます。",
      "encrypt.button": "暗号化",
      "sample.legend": "原作の暗号文",
      "sample.load": "入力欄に入れる",
      "save.button": "暗号文をPNGで保存",
      "output.filenames": "暗号文（ファイル名の列）",
      "output.font": "暗号文（GL-DancingMenフォント用の文字列）",
      "output.fontNote": "小文字が旗なし、大文字が旗あり。GL-DancingMenフォントを指定すると、そのまま踊る人形になります。" +
        "復号タブへ貼り付けると元の文に戻せます。",
      "copy.fontButton": "フォント用の文字列をコピー",
      "decrypt.intro": "下の人形をクリックするか、Tabで選んでEnterを押すと、対応する文字を復元できます。",
      "decrypt.pick": "▼ 以下の人形を選んで復号対象に追加します。",
      "decrypt.plainHeading": "旗なし",
      "decrypt.flagHeading": "旗あり（語の終わり）",
      "decrypt.pasteLabel": "暗号文のテキストを貼り付ける（フォント用の文字列、またはファイル名の列）",
      "decrypt.pasteButton": "貼り付けた暗号文を復号",
      "decrypt.figuresHeading": "入力した人形",
      "decrypt.clear": "クリア",
      "decrypt.delete": "1文字削除",
      "decrypt.resultHeading": "復号結果",
      "copy.decryptButton": "復号結果をコピー",
      "table.intro": "以下はアルファベットと踊る人形の対応表です（平文文字がアルファベット、暗号化文字が人形文字）。",
      "table.zoomHint": "クリック、またはTabで選んでEnterを押すと拡大表示されます。",
      "table.flagHeading": "🚩 旗ありの意味",
      "table.flagLead": "「旗あり」の人形は、その直後に",
      "table.flagStrong": "空白が来る",
      "table.flagRest": "ことを示します。続く行に英字がある場合も、行末の文字に旗が付きます。空行は通の区切りです。",
      "table.flagExample": "たとえば \"HELLO WORLD\" では、\"O\" の次がスペースなので \"Of.svg\"（旗付き）が使われます。",
      "table.sampleLabel": "サンプル：",
      "table.sampleAlt": "Of（旗あり）",
      "table.sampleNote": " は \"O\" + 空白",
      "modal.aria": "人形の拡大表示",
      "modal.close": "閉じる",
      "footer.repo": "🔗 GitHubリポジトリはこちら（",
      "footer.repoEnd": "）",
      "feedback.removed": "使えない文字を取り除きました: {chars}",
      "feedback.replaced": "全角の英字・スペースやタブを半角に置き換えました",
      "feedback.truncated": "{max}文字を超えた分は切り捨てました",
      "feedback.separator": " ／ ",
      "encrypt.count": "暗号化可能文字数: {count}",
      "figure.letter": "{letter}",
      "figure.flag": "{letter}（旗あり）",
      "sample.label": "{number}通目 {text}",
      "sample.lineSeparator": "／",
      "sample.multiline": "（2行）",
      "sample.all": "{count}通すべて（空行で区切る）",
      "copy.fontSuccess": "フォント用の文字列をコピーしました",
      "copy.failure": "コピーできませんでした。文字列を選択して手動でコピーしてください",
      "save.tooLarge": "画像が大きすぎて保存できません。1行を短くするか、行数を減らしてください",
      "save.unavailable": "このページをfile://で開いているときはPNGを保存できません。" +
        "公開ページか、ローカルサーバー（python -m http.server など）で開いてください",
      "save.success": "暗号文をPNGで保存しました",
      "figure.plain": "{letter}（旗なし）",
      "figure.zoom": "{figure}を拡大",
      "decode.tooLong": "人形が{max}個を超える暗号文は復号できません。短くしてから貼り付けてください",
      "decode.invalid": "読めなかった部分: {chars}",
      "decode.more": " ほか{count}件",
      "copy.decryptSuccess": "復号結果をコピーしました"
    },
    en: {
      "list.open": "“",
      "list.close": "”",
      "app.title": "DancingMen CipherLab - Sherlock Holmes Dancing Men Cipher Tool",
      "app.description": "A tool for trying out the Dancing Men cipher from Arthur Conan Doyle's Sherlock Holmes.",
      "app.langButton": "日本語",
      "app.langAria": "Switch language",
      "tabs.aria": "Encrypt, decrypt and substitution table",
      "tab.encrypt": "🔐 Encrypt",
      "tab.decrypt": "🔓 Decrypt",
      "tab.table": "📓 Substitution table",
      "encrypt.inputLabel": "Enter the plaintext (A-Z, spaces and line breaks)",
      "encrypt.placeholder": "Type something like HELLO WORLD",
      "encrypt.hint": "A-Z, spaces and line breaks are allowed. Full-width letters and spaces become half-width.",
      "encrypt.button": "Encrypt",
      "sample.legend": "Messages from the original story",
      "sample.load": "Put it in the input box",
      "save.button": "Save the ciphertext as a PNG",
      "output.filenames": "Ciphertext (a list of file names)",
      "output.font": "Ciphertext (a string for the GL-DancingMen font)",
      "output.fontNote": "Lower case means no flag and upper case means a flag. Apply the GL-DancingMen font " +
        "and the string turns into dancing men. Paste it into the decrypt tab to get the original text back.",
      "copy.fontButton": "Copy the font string",
      "decrypt.intro": "Click a figure below, or select it with Tab and press Enter, to restore the letter it stands for.",
      "decrypt.pick": "▼ Choose figures below to add them to the decryption.",
      "decrypt.plainHeading": "Without a flag",
      "decrypt.flagHeading": "With a flag (end of a word)",
      "decrypt.pasteLabel": "Paste the ciphertext (a font string, or a list of file names)",
      "decrypt.pasteButton": "Decrypt the pasted ciphertext",
      "decrypt.figuresHeading": "Figures entered",
      "decrypt.clear": "Clear",
      "decrypt.delete": "Delete one letter",
      "decrypt.resultHeading": "Decrypted text",
      "copy.decryptButton": "Copy the decrypted text",
      "table.intro": "The table below pairs every letter of the alphabet with its dancing man " +
        "(the plaintext letter first, the cipher figure after it).",
      "table.zoomHint": "Click a figure, or select it with Tab and press Enter, to see it enlarged.",
      "table.flagHeading": "🚩 What the flag means",
      "table.flagLead": "A figure that holds a flag tells you that ",
      "table.flagStrong": "a space follows",
      "table.flagRest": " right after it. The last letter of a line also carries a flag when the next line " +
        "still has letters. A blank line separates one message from the next.",
      "table.flagExample": "In \"HELLO WORLD\", for instance, a space follows the \"O\", " +
        "so \"Of.svg\" (with a flag) is used.",
      "table.sampleLabel": "Example: ",
      "table.sampleAlt": "Of (with a flag)",
      "table.sampleNote": " stands for \"O\" followed by a space",
      "modal.aria": "Enlarged view of a figure",
      "modal.close": "Close",
      "footer.repo": "🔗 GitHub repository: ",
      "footer.repoEnd": "",
      "feedback.removed": "Removed the characters that cannot be used: {chars}",
      "feedback.replaced": "Full-width letters, full-width spaces and tabs became half-width",
      "feedback.truncated": "Everything past {max} characters was cut off",
      "feedback.separator": " / ",
      "encrypt.count": "Characters that can be encrypted: {count}",
      "figure.letter": "{letter}",
      "figure.flag": "{letter} (with a flag)",
      "sample.label": "Message {number}: {text}",
      "sample.lineSeparator": " / ",
      "sample.multiline": " (2 lines)",
      "sample.all": "All {count} messages (separated by blank lines)",
      "copy.fontSuccess": "Copied the font string",
      "copy.failure": "Could not copy. Select the text and copy it by hand",
      "save.tooLarge": "The image is too large to save. Shorten a line, or use fewer lines",
      "save.unavailable": "A PNG cannot be saved while this page is open over file://. " +
        "Open the published page, or serve the folder locally (python -m http.server, for example)",
      "save.success": "Saved the ciphertext as a PNG",
      "figure.plain": "{letter} (no flag)",
      "figure.zoom": "Enlarge {figure}",
      "decode.tooLong": "Ciphertext with more than {max} figures cannot be decrypted. Shorten it before pasting",
      "decode.invalid": "Parts that could not be read: {chars}",
      "decode.more": " and {count} more",
      "copy.decryptSuccess": "Copied the decrypted text"
    }
  };

  function format(lang, key, values = {}) {
    const dictionary = dictionaries[lang];
    if (!dictionary || !Object.hasOwn(dictionary, key)) {
      throw new Error(`Unknown message: ${lang}/${key}`);
    }
    return dictionary[key].replace(/\{([^}]+)\}/g, (_, name) => {
      if (!Object.hasOwn(values, name)) throw new Error(`Missing message value: ${name}`);
      const value = values[name];
      return Array.isArray(value)
        ? value.map(item => dictionary["list.open"] + item + dictionary["list.close"]).join("")
        : String(value);
    });
  }

  return { DEFAULT_LANG, LANGUAGES, dictionaries, format };
})();

globalThis.DancingMenMessages = DancingMenMessages;
if (typeof module === "object" && module.exports) {
  module.exports = DancingMenMessages;
}
