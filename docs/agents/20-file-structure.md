# ディレクトリ構成ルール

## 基本構成

初期状態では、以下の構成を基本とします。

```text
/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  └─ main.js
├─ assets/
│  ├─ images/
│  ├─ icons/
│  └─ fonts/
├─ docs/
│  ├─ SPEC.md
│  └─ agents/
├─ AGENTS.md
└─ README.md
```

## 役割

### `index.html`

トップページです。  
GitHub Pagesで最初に表示されるファイルです。

### `css/`

CSSを置きます。

### `js/`

JavaScriptを置きます。

### `assets/images/`

画像を置きます。

### `assets/icons/`

アイコン素材を置きます。

### `assets/fonts/`

フォントファイルを置きます。  
初期段階では空でも構いません。

### `docs/`

仕様書や運用メモを置きます。

### `docs/agents/`

AIエージェント向けの分割ルールを置きます。

## 空ディレクトリ

空ディレクトリをGit管理したい場合は `.gitkeep` を置いてください。
