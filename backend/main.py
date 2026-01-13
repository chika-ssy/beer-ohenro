from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import os

app = FastAPI()

# フロントエンド（localhost:3000）からのアクセスを許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-app-name.vercel.app" # 自分のVercelのURLが決まったら追記
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/breweries")
def get_breweries():
    with open("breweries_with_geo.json", "r", encoding="utf-8") as f:
        breweries = json.load(f)
    
    # 有効な緯度経度のみをフィルタリング & ユニークキーを生成
    valid_breweries = []
    seen_ids = set()
    
    for i, brewery in enumerate(breweries):
        # 緯度経度が数値かチェック
        if isinstance(brewery.get("lat"), (int, float)) and isinstance(brewery.get("lng"), (int, float)):
            # ユニークなIDを生成（重複を防ぐ）
            original_id = brewery.get("id", f"brewery_{i}")
            unique_id = original_id
            counter = 1
            
            # 重複があれば番号を付与
            while unique_id in seen_ids:
                unique_id = f"{original_id}_{counter}"
                counter += 1
            
            seen_ids.add(unique_id)
            brewery["id"] = unique_id
            valid_breweries.append(brewery)
    
    return valid_breweries

@app.get("/beers")
def read_beers():
    with open("beer_scraper/breweries.json", "r", encoding="utf-8") as json_file:
        beer_data = json.load(json_file)
    return JSONResponse(content=beer_data)

print("jsonデータを読み込みました。")