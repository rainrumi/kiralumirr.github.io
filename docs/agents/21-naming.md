# 命名規則

## ファイル名

ファイル名は、原則として小文字英数字とハイフンを使ってください。

良い例：

```text
profile-icon.png
work-sample-01.jpg
main-visual.png
style.css
main.js
```

悪い例：

```text
プロフィール画像.png
Image 1.png
新しい画像.jpg
MainVisual.PNG
```

## 日本語ファイル名

日本語ファイル名は使わないでください。

理由：

- 環境によって文字化けする可能性がある
- URLとして扱いにくい
- GitHub Pages上でパスミスが起きやすい

## CSSクラス名

CSSクラス名は、意味が分かる英語のケバブケースにしてください。

良い例：

```text
site-header
hero-section
profile-card
work-card
link-list
section-title
```

悪い例：

```text
box1
aaa
redText
ProfileCard
```

## ID名

ページ内リンク用IDも英語のケバブケースにしてください。

例：

```html
<section id="profile">
<section id="works">
<section id="external-links">
```
