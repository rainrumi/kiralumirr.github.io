# 画像・素材管理ルール

## 配置場所

画像は以下に置いてください。

```text
assets/images/
```

アイコンは以下に置いてください。

```text
assets/icons/
```

フォントは以下に置いてください。

```text
assets/fonts/
```

## ファイル名

ファイル名は小文字英数字とハイフンを使ってください。

良い例：

```text
profile-icon.png
work-sample-01.jpg
ogp-image.png
```

## 画像サイズ

不要に大きい画像を置かないでください。

初期段階では、画像は軽量で扱いやすいものを優先します。

## alt属性

意味のある画像には、必ず `alt` 属性を付けてください。

例：

```html
<img src="assets/images/profile-icon.png" alt="プロフィールアイコン">
```

装飾目的の画像は空の `alt` を使います。

```html
<img src="assets/images/decorative.png" alt="">
```

## 禁止事項

- 日本語ファイル名を使う
- 巨大な画像をそのまま置く
- 意味のある画像に `alt` を付けない
- 架空の人物画像や作品画像を本物のように追加する
