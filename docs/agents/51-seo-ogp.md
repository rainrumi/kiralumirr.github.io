# SEO / OGP

## 基本メタタグ

`index.html` の `head` には、最低限以下を入れてください。

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TODO: サイトタイトル</title>
<meta name="description" content="TODO: サイト説明文">
```

## OGP

OGP用に、以下を入れてください。

```html
<meta property="og:title" content="TODO: サイトタイトル">
<meta property="og:description" content="TODO: サイト説明文">
<meta property="og:type" content="website">
<meta property="og:image" content="assets/images/ogp.png">
```

## 注意点

サイトタイトル、説明文、OGP画像が未確定の場合は `TODO` としてください。

ユーザーが明示していない正式なサイト名や説明文を勝手に作らないでください。

## 初期段階でやらないこと

初期段階では、以下は不要です。

- 複雑な構造化データ
- サイトマップ自動生成
- RSS生成
- 検索エンジン向けの高度な最適化

まずは基本メタタグとOGPの土台だけ作ってください。
