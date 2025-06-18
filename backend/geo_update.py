import json
import time
import requests
from dotenv import load_dotenv
import os

# .envファイルを読み込む
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
        print(f"Geocode失敗: {address} → {data['status']}")
        return "○○○○", "○○○○"

with open("beer_scraper/breweries.json", "r", encoding="utf-8") as f:
    breweries = json.load(f)

for brewery in breweries:
    if brewery["lat"] == "○○○○":
        lat, lng = geocode(brewery["address"])
        brewery["lat"] = lat
        brewery["lng"] = lng
        time.sleep(0.2)

with open("breweries_with_geo.json", "w", encoding="utf-8") as f:
    json.dump(breweries, f, ensure_ascii=False, indent=2)

print("緯度・経度を追加して保存しました！")
