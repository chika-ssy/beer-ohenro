import json
import time
import requests
from dotenv import load_dotenv
import os

# .envファイルの読み込み
load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

def geocode(brewery):
    # ブランド名やパブ名を住所に加えて精度を上げる
    pub_clean = brewery['pub'].replace('パブなし', '').strip()
    address = f"{brewery['address']} {pub_clean} {brewery['brand']}, Japan"
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": address, "key": API_KEY}
    res = requests.get(url, params=params)
    data = res.json()

    if data["status"] == "OK":
    # if True:
        location = data["results"][0]["geometry"]["location"]
        return location["lat"], location["lng"]
    else:
        print(f"⚠ Geocode失敗: {address} → {data['status']}")
        return None, None

# JSONファイル読み込み
with open("beer_scraper/breweries.json", "r", encoding="utf-8") as f:
    breweries = json.load(f)

# 緯度・経度の追加
for i, brewery in enumerate(breweries):
    if brewery["lat"] in ["○○○○", None, "", "NaN"]:
        print(f"{i+1}/{len(breweries)}: 検索中 → {brewery['brand']}")
        lat, lng = geocode(brewery)
        if lat is not None and lng is not None:
            brewery["lat"] = lat
            brewery["lng"] = lng
        else:
            brewery["lat"] = "取得失敗"
            brewery["lng"] = "取得失敗"
        time.sleep(0.2)

# 保存
with open("breweries_with_geo.json", "w", encoding="utf-8") as f:
    json.dump(breweries, f, ensure_ascii=False, indent=2)

print("✅ 緯度・経度の更新処理が完了しました。")
