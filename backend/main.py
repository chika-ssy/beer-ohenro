from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json

app = FastAPI()

# フロントエンド（localhost:3000）からのアクセスを許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.jsのURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/breweries")
def get_breweries():
    with open("breweries_with_geo.json", "r", encoding="utf-8") as f:
        breweries = json.load(f)
    return breweries

# JSONデータをロード
with open("beer_scraper/breweries.json", "r", encoding="utf-8") as json_file:
    beer_data = json.load(json_file)

@app.get("/beers")
def read_beers():
    return JSONResponse(content=beer_data)

print("jsonデータを読み込みました。")