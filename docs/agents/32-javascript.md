# JavaScript実装ルール

## 基本方針

JavaScriptは最小限にしてください。

初期段階では、Vanilla JavaScriptのみを使用します。

## 使用してよい機能

- スマホメニューの開閉
- トップへ戻るボタン
- 簡単な表示切り替え
- 軽いUI補助

## 使用しない機能

- 複雑な状態管理
- API通信
- ログイン処理
- データベース連携
- 大きな外部ライブラリ
- 過度なアニメーション

## 安全な実装

DOM要素が存在しない場合でもエラーにならないようにしてください。

例：

```js
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".site-nav");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
}
```

## JavaScriptなしでも読めること

JavaScriptが無効でも、主要な文章・リンク・作品一覧は閲覧できる構造にしてください。
