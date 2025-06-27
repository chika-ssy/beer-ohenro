import chardet
from bs4 import BeautifulSoup
import json

# HTMLファイルのパス
file_path = "shikoku_beer.html"

# 1. バイナリで読み込み → エンコード自動判定
with open(file_path, "rb") as f:
    raw_data = f.read()
    encoding = chardet.detect(raw_data)["encoding"]

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
            continue

        brand = cols[0].get_text(strip=True)
        pub = cols[1].get_text(strip=True)
        company = cols[2].get_text(strip=True)
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
