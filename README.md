# 🍻 beerOHENRO（麦酒遍路）

**beerOHENRO** は、四国のクラフトビールスポットを巡る「Webチェックイン型お遍路システム」です。  
現在地に応じてブルワリーに「チェックイン」でき、訪問記録をスタンプラリー感覚で楽しめます。

- 🔧 フロントエンド：Next.js（React）
- 🛠️ バックエンド：FastAPI（Python）
- 📍 位置情報：Google Maps JavaScript API / Geocoding API

---

## ディレクトリ構成
```
beerOHENRO/
├── backend/ # FastAPI によるAPIサーバー
├── frontend/ # Next.js によるユーザーインターフェース
├── .gitignore # 除外ファイル指定
├── LICENSE
└── README.md # プロジェクト全体の説明（このファイル）
```
---

## セットアップ手順（ローカル環境）
### 1. リポジトリをクローン
```bash
git clone https://github.com/あなたのユーザー名/beer-ohenro.git
cd beer-ohenro
```

### 2. フロントエンドのセットアップ
```bash
cd frontend
cp .env.local.example .env.local    # .envファイルを作成（なければ直接作成）
npm install
npm run dev
```

### 3. バックエンドのセットアップ
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # または source venv/bin/activate（Mac/Linux）
pip install -r requirements.txt
uvicorn main:app --reload
```

## 使用APIと環境変数
Google Cloud の以下のAPIを使用しています：
- Google Maps JavaScript API（地図表示）
- Google Maps Geocoding API（住所 → 緯度経度変換）

環境変数 `.env.local`（フロント）と `.env`（バックエンド）に、次のように記述してください：
```env
# frontend/.env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

# backend/.env
GOOGLE_API_KEY=your_api_key_here
```

## 各モジュールの詳細
- [frontend/README.md](./frontend/README.md) — ユーザー画面の開発手順や使用技術
- [backend/README.md](./backend/README.md) — APIサーバーの構築と起動方法

## ライセンス
MIT License に基づいて公開しています。