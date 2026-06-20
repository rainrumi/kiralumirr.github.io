# コミットする時のコメントについて
- コミット時のコメントは必ず日本語で書かなければいけません。

# AGENTS.md

## このファイルの役割

このリポジトリは、GitHub Pagesで公開する静的な個人サイト・ポートフォリオサイトです。

この `AGENTS.md` は、Codex やAIエージェントが作業を始めるための入口です。  
詳細な仕様やルールは、このファイルには書きすぎず、`docs/agents/` 以下の分割ドキュメントを必要に応じて参照してください。

毎回すべての仕様を読む必要はありません。  
作業内容に関係するファイルだけを読んでください。

---

## 最優先方針

このサイトの基本方針は以下です。

```text
軽い
見やすい
壊れにくい
編集しやすい
GitHub Pagesで公開しやすい
```

初期段階では、凝った実装よりも「安全に公開できる土台」を優先してください。

---

## 基本技術

原則として、以下だけを使用してください。

- HTML
- CSS
- Vanilla JavaScript
- Markdown
- 静的画像ファイル

明示的な指示がない限り、以下は導入しないでください。

- npm
- React
- Vue
- Next.js
- Astro
- Vite
- TypeScript
- PHP
- Pythonサーバー
- Rubyサーバー
- データベース
- CMS
- ログイン機能
- 管理画面

---

## まず読むべきドキュメント

作業内容に応じて、以下のドキュメントを参照してください。

### 全体方針

- [プロジェクト概要](docs/agents/00-project-overview.md)
- [実装の優先順位](docs/agents/01-priorities.md)

### GitHub Pages関連

- [GitHub Pages公開ルール](docs/agents/10-github-pages.md)
- [独自ドメイン設定メモ](docs/agents/11-custom-domain.md)

### ファイル構成

- [ディレクトリ構成ルール](docs/agents/20-file-structure.md)
- [命名規則](docs/agents/21-naming.md)
- [画像・素材管理ルール](docs/agents/22-assets.md)

### HTML / CSS / JavaScript

- [HTML実装ルール](docs/agents/30-html.md)
- [CSS実装ルール](docs/agents/31-css.md)
- [JavaScript実装ルール](docs/agents/32-javascript.md)

### ページ構成

- [トップページ構成](docs/agents/40-top-page.md)
- [作品一覧セクション](docs/agents/41-works.md)
- [プロフィール・リンク欄](docs/agents/42-profile-links.md)

### 品質ルール

- [アクセシビリティ](docs/agents/50-accessibility.md)
- [SEO / OGP](docs/agents/51-seo-ogp.md)
- [パフォーマンス](docs/agents/52-performance.md)

### 運用・編集

- [README作成ルール](docs/agents/60-readme.md)
- [TODO・仮テキスト運用](docs/agents/61-placeholders.md)
- [変更時のチェックリスト](docs/agents/70-checklist.md)

---

## 作業時の読み方

作業前に、必ずこの `AGENTS.md` を読んでください。

その後、作業内容に関係するドキュメントだけを読んでください。

### HTMLを編集する場合

読むファイル：

- `docs/agents/00-project-overview.md`
- `docs/agents/30-html.md`
- `docs/agents/40-top-page.md`

### CSSを編集する場合

読むファイル：

- `docs/agents/31-css.md`
- `docs/agents/52-performance.md`

### GitHub Pages公開設定を確認する場合

読むファイル：

- `docs/agents/10-github-pages.md`
- `docs/agents/70-checklist.md`

### 画像を追加・差し替えする場合

読むファイル：

- `docs/agents/22-assets.md`
- `docs/agents/21-naming.md`
- `docs/agents/50-accessibility.md`

### READMEを編集する場合

読むファイル：

- `docs/agents/60-readme.md`

---

## ルールの優先順位

ルールが競合する場合は、以下の順に優先してください。

1. ユーザーからの直接指示
2. この `AGENTS.md`
3. `docs/agents/` 以下の該当ドキュメント
4. `docs/SPEC.md`
5. 既存コードのスタイル

---

## コンテキスト節約方針

AIエージェントは、不要なドキュメントを一度に読み込まないでください。

悪い例：

```text
作業前に docs/agents/ 以下を全部読む
```

良い例：

```text
CSS修正なので AGENTS.md と docs/agents/31-css.md だけ読む
```

目的は、コンテキストを節約しつつ、必要なルールだけを正確に適用することです。

---

## 禁止事項

明示的な指示がない限り、以下は禁止です。

- フレームワークを勝手に導入する
- npmプロジェクト化する
- サーバーサイド処理を追加する
- データベースを追加する
- ログイン機能を追加する
- CMSを導入する
- 架空の正式プロフィールを書く
- 架空の作品情報を本物のように書く
- 日本語ファイル名を使う
- 大量の外部ライブラリを追加する
- GitHub Pagesで動かない構成にする

---

## 仮テキストの扱い

サイト本文が未確定の場合は、必ず `TODO` を付けた仮テキストにしてください。

良い例：

```html
<p>TODO: ここにプロフィール文を入れる。</p>
```

悪い例：

```html
<p>個人ゲーム制作者として活動しています。</p>
```

ユーザーが明示していない情報を、事実のように書かないでください。

---

## 最初に作る基本ファイル

初期実装では、最低限以下を作成してください。

```text
/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  └─ main.js
├─ assets/
│  ├─ images/
│  │  └─ .gitkeep
│  ├─ icons/
│  │  └─ .gitkeep
│  └─ fonts/
│     └─ .gitkeep
├─ docs/
│  ├─ SPEC.md
│  └─ agents/
│     ├─ 00-project-overview.md
│     ├─ 01-priorities.md
│     ├─ 10-github-pages.md
│     ├─ 11-custom-domain.md
│     ├─ 20-file-structure.md
│     ├─ 21-naming.md
│     ├─ 22-assets.md
│     ├─ 30-html.md
│     ├─ 31-css.md
│     ├─ 32-javascript.md
│     ├─ 40-top-page.md
│     ├─ 41-works.md
│     ├─ 42-profile-links.md
│     ├─ 50-accessibility.md
│     ├─ 51-seo-ogp.md
│     ├─ 52-performance.md
│     ├─ 60-readme.md
│     ├─ 61-placeholders.md
│     └─ 70-checklist.md
├─ AGENTS.md
└─ README.md
```

---

## 完了前チェック

作業完了前に、最低限以下を確認してください。

- `index.html` がリポジトリ直下にある
- CSSのパスが正しい
- JavaScriptのパスが正しい
- GitHub Pagesで公開できる静的構成になっている
- スマホ表示が大きく崩れない
- 仮テキストには `TODO` が付いている
- 架空の正式情報を追加していない
- 日本語ファイル名を使っていない
- READMEに編集方法が書かれている

---

## 最終方針

このリポジトリでは、AIエージェントに毎回長い仕様書を読ませないことを重視します。

`AGENTS.md` は入口です。  
詳細は分割ドキュメントに逃がし、作業内容に応じて必要な部分だけ参照してください。
