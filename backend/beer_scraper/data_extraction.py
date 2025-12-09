import chardet
from bs4 import BeautifulSoup
import json
<<<<<<< HEAD
import requests
import time
import os
from dotenv import load_dotenv

# .envファイルのパスを明示的に指定
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
print(f"📁 .envファイルのパス: {env_path}")
print(f"📁 .envファイルが存在するか: {os.path.exists(env_path)}")

load_dotenv(dotenv_path=env_path)
=======
>>>>>>> 69074f77765be510ee85879d4ef2720a10f963de

# HTMLファイルのパス
file_path = "shikoku_beer.html"

<<<<<<< HEAD
# Google Geocoding API キー
GOOGLE_API_KEY = os.getenv("GOOGLE_GEOCODING_API_KEY")

print(f"🔑 APIキーの最初の10文字: {GOOGLE_API_KEY[:10] if GOOGLE_API_KEY else 'None'}")

if not GOOGLE_API_KEY:
    print("❌ エラー: GOOGLE_GEOCODING_API_KEYが設定されていません")
    print("backend/.env ファイルに以下を追加してください：")
    print("GOOGLE_GEOCODING_API_KEY=あなたのAPIキー")
    exit(1)

def get_detailed_address(brand_name, pub_name, city):
    """
    ブルワリー名とパブ名から詳細な住所を取得
    """
    search_query = pub_name if pub_name and pub_name != "パブなし" else brand_name
    search_query = f"{search_query} {city}"
    
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": search_query,
        "key": GOOGLE_API_KEY,
        "language": "ja",
        "region": "jp"
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if data["status"] == "OK" and len(data["results"]) > 0:
            result = data["results"][0]
            return {
                "address": result["formatted_address"],
                "lat": result["geometry"]["location"]["lat"],
                "lng": result["geometry"]["location"]["lng"]
            }
        else:
            print(f"  ⚠️  取得失敗: {data.get('status', 'UNKNOWN')}")
            return None
            
    except Exception as e:
        print(f"  ❌ エラー: {e}")
        return None

# 1. HTMLを読み込み
print("📄 HTMLファイルを読み込み中...")
=======
# 1. バイナリで読み込み → エンコード自動判定
>>>>>>> 69074f77765be510ee85879d4ef2720a10f963de
with open(file_path, "rb") as f:
    raw_data = f.read()
    encoding = chardet.detect(raw_data)["encoding"]

<<<<<<< HEAD
html = raw_data.decode(encoding, errors="ignore")
soup = BeautifulSoup(html, "html.parser")

# 2. データを抽出
breweries = []
rows = soup.select("tr[valign='top']")

print(f"\n🔍 {len(rows)} 行を処理中...\n")

for row in rows:
    cols = row.find_all("td")
    if len(cols) == 4:
        if cols[0].get_text(strip=True) == "ブランド名":
            continue

        if any(mark in str(row) for mark in ["閉店", "閉園", "醸造終了", "移転"]):
=======
# 2. 判定されたエンコードで読み込み直す
html = raw_data.decode(encoding, errors="ignore")
soup = BeautifulSoup(html, "html.parser")

# 3. 行データを取得
breweries = []
rows = soup.select("tr[valign='top']")
for row in rows:
    cols = row.find_all("td")
    if len(cols) == 4:
        # ✅ 表のヘッダー行を除外
        if cols[0].get_text(strip=True) == "ブランド名":
            continue

        # ✅ 閉店等を除外
        if any(mark in str(row) for mark in ["閉店", "閉園", "醸造終了"]):
>>>>>>> 69074f77765be510ee85879d4ef2720a10f963de
            continue

        brand = cols[0].get_text(strip=True)
        pub = cols[1].get_text(strip=True)
        company = cols[2].get_text(strip=True)
<<<<<<< HEAD
        city = cols[3].get_text(strip=True)
        brand_id = brand.replace(" ", "_").replace("　", "_").lower()

        print(f"🍺 {brand}")
        
        location_data = get_detailed_address(brand, pub, city)
        
        if location_data:
            breweries.append({
                "id": brand_id,
                "brand": brand,
                "pub": pub,
                "company": company,
                "address": location_data["address"],
                "lat": location_data["lat"],
                "lng": location_data["lng"]
            })
            print(f"  ✅ {location_data['address']}\n")
        else:
            breweries.append({
                "id": brand_id,
                "brand": brand,
                "pub": pub,
                "company": company,
                "address": city,
                "lat": "取得失敗",
                "lng": "取得失敗"
            })
            print("")
        
        time.sleep(1)

# 3. JSONファイルに保存
output_file = "../breweries_with_geo.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(breweries, f, ensure_ascii=False, indent=2)

success_count = len([b for b in breweries if b['lat'] != '取得失敗'])
fail_count = len([b for b in breweries if b['lat'] == '取得失敗'])

print(f"\n{'='*50}")
print(f"✅ 完了: {len(breweries)} 件のブルワリー情報を保存")
print(f"   成功: {success_count} 件")
print(f"   失敗: {fail_count} 件")
print(f"{'='*50}")
=======
        address = cols[3].get_text(strip=True)
        brand_id = brand.replace(" ", "_").replace("　", "_").lower()

        breweries.append({
            "id": brand_id,
            "brand": brand,
            "pub": pub,
            "company": company,
            "address": address,
            "lat": "○○○○",
            "lng": "○○○○"
        })

# 4. JSONファイルに保存（例: breweries.json）
with open("breweries.json", "w", encoding="utf-8") as f:
    json.dump(breweries, f, ensure_ascii=False, indent=2)

print(f"{len(breweries)} 件のブルワリー情報を保存しました。")
>>>>>>> 69074f77765be510ee85879d4ef2720a10f963de
