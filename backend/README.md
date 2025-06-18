# 🍺 beerOHENRO - バックエンド

このディレクトリは、四国のクラフトビールスポットをチェックインできるWebアプリ「麦酒遍路（びーるおへんろ）」のバックエンドを構成しています。  
FastAPI を使用して、フロントエンド（Next.js）とのデータ通信を行います。

---

## 🚀 起動方法

1. 仮想環境を作成・起動（初回のみ）：
```bash
python -m venv venv
venv\Scripts\activate  # Windows の場合
source venv/bin/activate  # macOS/Linux の場合
```

2. 必要なパッケージをインストール：
```bash
pip install -r requirements.txt
```

3. 開発サーバーを起動：
```bash
uvicorn main:app --reload
```
ブラウザで http://localhost:8000 を開くとAPIにアクセスできます。

## 環境変数
バックエンドでAPIキーなどを使用する場合は、プロジェクトルートに `.env `ファイルを作成して、以下のように記述します：

```env
GOOGLE_API_KEY=your_api_key_here
```
`.env` は `.gitignore` によりGitHubにはアップロードされません。セキュリティ保護のためにも、絶対に公開しないようにしてください。

## ファイル構成
```
backend/
├── main.py # FastAPIのエントリーポイント
├── geo_update.py # 緯度経度データの付加スクリプト
├── shikoku_beer_data.json # 手動入力またはスクレイピング元データ
├── breweries.json # 緯度経度付きブルワリーデータ（API提供用）
├── .env # 環境変数ファイル（公開しない）
├── requirements.txt # 必要なPythonパッケージ一覧
└── README.md # このファイル（バックエンドの説明）
```

## APIエンドポイント
`GET /api/breweries`→ ブルワリーのリストをJSON形式で取得できます。

## 開発時の注意
`geo_update.py` は Google Maps API キーを使用してデータに位置情報を付加します。

`.env` ファイルがないと実行できないので注意してください。

`.env` をGitにコミットしてしまった場合は、履歴から完全に削除してください（`git filter-repo`などを利用）。

## 使用技術
Python 3.10+
FastAPI
Uvicorn
Python-dotenv
Google Maps Geocoding API（位置情報取得用）

## ライセンス
このプロジェクトはMITライセンスのもとで公開されています。