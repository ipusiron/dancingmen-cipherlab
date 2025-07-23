# DancingMen CipherLab - ドイルの踊る人形暗号ツール

![GitHub Repo stars](https://img.shields.io/github/stars/ipusiron/dancingmen-cipherlab?style=social)
![GitHub forks](https://img.shields.io/github/forks/ipusiron/dancingmen-cipherlab?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/ipusiron/dancingmen-cipherlab)
![GitHub license](https://img.shields.io/github/license/ipusiron/dancingmen-cipherlab)

**Day022 - 生成AIで作るセキュリティツール100**

**DancingMen CipherLab** は、シャーロック・ホームズの短編「踊る人形」に登場する古典暗号を再現・体験できるWebツールです。
英文を入力すると、それぞれの文字が踊る人形の図形に変換されて暗号文が生成されます。

本ツールでは、以下のような特徴を備えています：

- ✍️ **平文を入力すると自動で暗号化**
- 👣 **「旗付き人形」による空白表現**
- 🖼 **視覚的に並ぶ人形で暗号の雰囲気を体感**
- 🔁 **今後は復号支援機能にも対応予定**
- 🧩 **SVG素材はtight調整済みでコンパクトに表示**

古典暗号やシャーロキアンに興味のある方、遊びながら暗号を学びたい方におすすめのツールです。

---

## 🌐 デモページ

👉 [https://ipusiron.github.io/dancingmen-cipherlab/](https://ipusiron.github.io/dancingmen-cipherlab/)

---

## 📸 スクリーンショット

>![暗号化の例](assets/screenshot_of_encryption.png)
>*暗号化の例*
>
>![復号の例](assets/screenshot_of_decryption.png)
>*復号の例*

---
## 🖋 使用フォントについて

本ツールで使用している踊る人形のSVG素材は、[Gutenberg Labo / GL-DancingMen](https://github.com/Gutenberg-Labo/GL-DancingMen) にて公開されている **GL-DancingMen.ttf** フォントを基に生成しています。

このフォントを利用させていただき、1文字ずつSVG化することで、視覚的に踊る人形暗号を再現しています。

---
### 🧷 SVG素材のバリエーションについて（padded版とtight版）

本ツールでは、表示される「踊る人形」のSVG素材について、以下の2種類を用意しています：

| バージョン | 説明 |
|------------|------|
| **padded版** | 初期生成版。余白（padding）が多めに含まれており、ゆったりとした見た目です。比較・デザイン検証用途に向いています。 |
| **tight版**  | 余白を極限まで除去した正式版。`bbox_inches='tight'` に加え、左上基準配置やfigsize最小化などを組み合わせ、**人形同士の間隔がもっとも詰まった表示** になります。 |

---
### 📁 フォルダー構成

SVGファイルは以下のように整理されています：

```
assets/
└── svg/
     ├── padded/ # 余白ありの旧版
     └── tight/  # tight処理済・正式採用版
```

---
#### 🔧 表示切り替え方法

使用するSVGスタイルは、`script.js`内の以下の行で切り替え可能です：

```js
const svgFolder = "assets/svg/tight/"; // ← "padded/" に切り替えることも可能
```

---
### 🛠 TTFファイルからSVGファイルを生成する技術的解説

padded版SVGファイルとtight版SVGファイルを具体的にどう生成したのかを解説します。

#### padded版SVGの生成方法について

`assets/svg/padded/`以下に格納されているSVG素材は、`GL-DancingMen.ttf`の各文字をPython + Matplotlibを用いて以下の条件で生成したものです：

- **描画方式**：`matplotlib.pyplot.text()` により人形文字を描画
- **位置指定**：`x=0.5`, `y=0.5`, `ha='center'`, `va='center'`（中央寄せで描画）
- **出力設定**：
  - `figsize=(1, 1)`
  - `dpi=48`
  - `bbox_inches` の指定なし（デフォルト）
- **出力形式**：`A.svg` ～ `Z.svg`、および `Af.svg` ～ `Zf.svg`

このバージョンでは描画領域全体に対して人形文字が中央に配置されており、**周囲に比較的広めの余白が含まれる**のが特徴です。

表示のゆとりや比較用の素材として利用することを想定しています。

---
#### tight版SVGの生成方法について

デフォルトで使用されているSVG素材（`assets/svg/tight/` 以下）は、`GL-DancingMen.ttf`の各文字をベースにPython + Matplotlibによって以下の条件で自動生成したものです：

- **描画方式**：`matplotlib.pyplot.text()` により人形文字を描画
- **位置指定**：`x=0`, `y=1`, `ha='left'`, `va='top'`（左上に寄せて描画）
- **出力調整**：
  - `figsize=(0.4, 0.4)`
  - `dpi=120`
  - `bbox_inches='tight'` + `pad_inches=0` を指定し、**余白を極限まで除去**
- **出力形式**：1文字ごとに `A.svg` 〜 `Z.svg`（旗なし）、および `Af.svg` 〜 `Zf.svg`（旗あり）として保存

これにより、**人形同士の表示間隔が最小限となるtight版SVG**が実現されています。

---
## 🛠 このツールについて

本ツールは、「生成AIで作るセキュリティツール100」プロジェクトの一環として開発されました。 このプロジェクトでは、AIの支援を活用しながら、セキュリティに関連するさまざまなツールを100日間にわたり制作・公開していく取り組みを行っています。

プロジェクトの詳細や他のツールについては、以下のページをご覧ください。

🔗 [https://akademeia.info/?page_id=42163](https://akademeia.info/?page_id=42163)
