import json
import time
import requests
from dotenv import load_dotenv
import os

# .envファイルの読み込み
load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

def geocode(address):
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": address, "key": API_KEY}
    res = requests.get(url, params=params)
    data = res.json()

    if data["status"] == "OK":
        location = data["results"][0]["geometry"]["location"]
        return location["lat"], location["lng"]
    else:
        print(f"⚠ Geocode失敗: {address} → {data['status']}")
        return None, None  # ← 修正ポイント

with open("beer_scraper/breweries.json", "r", encoding="utf-8") as f:
    breweries = json.load(f)

for brewery in breweries:
    if brewery["lat"] in ["○○○○", None, "", "NaN"]:
        lat, lng = geocode(brewery["address"])
        if lat is not None and lng is not None:
            brewery["lat"] = lat
            brewery["lng"] = lng
        else:
            brewery["lat"] = None
            brewery["lng"] = None
        time.sleep(0.2)  # 過剰なリクエストを避ける

with open("breweries_with_geo.json", "w", encoding="utf-8") as f:
    json.dump(breweries, f, ensure_ascii=False, indent=2)

print("✅ 緯度・経度の更新処理が完了しました。")
