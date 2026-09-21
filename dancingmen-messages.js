// UI-independent messages. Additional languages can share the same keys.
const DancingMenMessages = (() => {
  const DEFAULT_LANG = "ja";
  const dictionaries = {
    ja: {
      "list.open": "「",
      "list.close": "」",
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

  return { DEFAULT_LANG, dictionaries, format };
})();

globalThis.DancingMenMessages = DancingMenMessages;
if (typeof module === "object" && module.exports) {
  module.exports = DancingMenMessages;
}
