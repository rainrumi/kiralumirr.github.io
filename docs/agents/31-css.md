# CSS実装ルール

## 基本方針

CSSは、分かりやすく、後から修正しやすい形にしてください。

## CSS変数

主要な色やサイズはCSS変数で管理してください。

例：

```css
:root {
  --color-bg: #ffffff;
  --color-text: #222222;
  --color-primary: #6c63ff;
  --color-secondary: #f5f5f5;
  --color-border: #dddddd;
}
```

## クラス名

クラス名は英語のケバブケースにしてください。

例：

```css
.site-header {}
.hero-section {}
.profile-card {}
.work-card {}
```

## 禁止事項

原則として、以下は避けてください。

- `!important`
- 過度に深いセレクタ
- 意味のないクラス名
- 大量のハードコード色
- 不要に複雑なレイアウト

## レスポンシブ

最低限、以下の幅で大きく崩れないようにしてください。

```text
Mobile: 320px以上
Tablet: 768px以上
Desktop: 1024px以上
```

作品カードなどのグリッドは、スマホでは1カラムにしてください。

例：

```css
@media (max-width: 767px) {
  .work-grid {
    grid-template-columns: 1fr;
  }
}
```

## 基本レイアウト

中央寄せのコンテナには、次のような形を使って構いません。

```css
.container {
  width: min(100% - 32px, 1080px);
  margin-inline: auto;
}
```
