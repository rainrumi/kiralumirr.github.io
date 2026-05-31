# GitHub Pages公開ルール

## 基本方針

このサイトはGitHub Pagesで公開できる構成にしてください。

初期設定は以下を想定します。

```text
Branch: main
Folder: /
```

## 必須条件

トップページは、リポジトリ直下の以下のファイルにしてください。

```text
index.html
```

## 禁止事項

GitHub Pagesで動作しない構成にしないでください。

禁止：

- サーバーサイド処理が必要な構成
- 環境変数が必須の構成
- データベースが必須の構成
- Node.jsサーバーが必要な構成
- 動的ルーティング前提の構成

## パス指定

CSSやJavaScriptの読み込みは、GitHub Pagesで動く相対パスにしてください。

例：

```html
<link rel="stylesheet" href="css/style.css">
<script src="js/main.js" defer></script>
```

## 内部リンク

内部リンクは静的サイトとして動く形にしてください。

良い例：

```html
<a href="#works">Works</a>
<a href="works/">作品一覧</a>
```

初期段階では、複雑なルーティングを前提にしないでください。
