'use client';

import { useEffect, useState } from "react";
import { getCheckIns, type Brewery } from "@/lib/checkin";
import HamburgerMenu from "@/components/HamburgerMenu";

// ボタンの共通スタイル定義（後で画像に差し替える部分）
const linkButtonStyle = (isVisited: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',  // アイコン画像のサイズに合わせて調整可能
  height: '36px',
  borderRadius: '50%',
  backgroundColor: isVisited ? '#fff' : '#e0e0e0',
  border: `1px solid ${isVisited ? '#b22222' : '#999'}`,
  color: isVisited ? '#b22222' : '#999',
  fontSize: '16px', // 絵文字のサイズ。画像にする場合は不要
  textDecoration: 'none',
  transition: '0.3s',
  boxShadow: '2px 2px 5px rgba(0,0,0,0.05)',
});

export default function BreweriesPage() {
  const [breweries, setBreweries] = useState<Brewery[]>([]);
  // IDをキーにしてレコード丸ごと保存する Map に変更
  const [checkInMap, setCheckInMap] = useState<Map<string, CheckInRecord>>(new Map());

  useEffect(() => {
    // ブルワリー一覧取得
    fetch('/api/breweries')
      .then((res) => res.json())
      .then((data) => setBreweries(data))
      .catch((err) => console.error(err));

    // チェックイン履歴の取得
    const loadCheckIns = async () => {
      const records = await getCheckIns();
      // Mapオブジェクトを作成 (breweryId => Record)
      const map = new Map(records.map(r => [r.breweryId, r]));
      setCheckInMap(map);
    };
    loadCheckIns();
  }, []);

  // 住所クリック時の処理（Mapページと同じ）
  const handleAddressClick = (address: string) => {
    const confirmed = window.confirm(`Google Mapsで「${address}」を開きますか？`);
    if (!confirmed) return;
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ 
      padding: '40px 20px',
      backgroundColor: '#f4f1ea',
      minHeight: '100vh',
      fontFamily: '"Noto Serif JP", serif'
      }}>

      {/* ハンバーガーメニュー */}
      <HamburgerMenu />
      <h1
        style={{
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <img 
          src="/beerHenro_logo.png" 
          alt="麦酒遍路" 
          style={{
            maxWidth: '200px',
            height: 'auto',
          }}
        />
      </h1>
      <h1 style={{ 
        textAlign: 'center', 
        fontSize: '28px', 
        marginBottom: '40px',
        color: '#333',
        borderBottom: '2px solid #d4c4a8',
        display: 'inline-block',
        width: '100%',
        paddingBottom: '10px'
      }}>
        御朱印帳
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {breweries.map((brewery) => {
          const record = checkInMap.get(brewery.id);
          const isVisited = !!record;

          // 日付のフォーマット例: 2025年2月3日
          const visitDate = record?.createdAt 
            ? new Date(record.createdAt).toLocaleDateString('ja-JP', {
                year: 'numeric', month: 'long', day: 'numeric'
              })
            : "";

          return (
            <div key={brewery.id} style={{
              backgroundColor: '#fcfaf2',
              border: '1px solid #d4c4a8',
              padding: '20px',
              borderRadius: '4px',
              boxShadow: '4px 4px 10px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transition: '0.3s',
              // 未訪問時は少し暗く
              filter: isVisited ? 'none' : 'grayscale(60%) opacity(0.8)'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                {/* スタンプエリア */}
                <div style={{ minWidth: '80px', height: '80px', marginRight: '20px', position: 'relative' }}>
                  <img 
                    src={brewery.stampUrl || `/stamps/${brewery.id}.png`}
                    alt="御朱印"
                    style={{
                      width: '100%', height: '100%', objectFit: 'contain',
                      transition: '0.5s ease',
                      // --- 手押し演出 ---
                      transform: isVisited ? 'rotate(-12deg) scale(1.1)' : 'rotate(0deg)',
                      opacity: isVisited ? 0.85 : 0.1, // 朱肉の透け感
                      filter: isVisited ? 'contrast(1.2)' : 'grayscale(100%)',
                    }}
                  />
                  {!isVisited && (
                    <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '10px', color: '#999', border: '1px solid #999', padding: '2px 4px', whiteSpace: 'nowrap' }}>
                      未参拝
                    </span>
                  )}
                </div>

                {/* 情報エリア */}
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#333', fontWeight: 'bold' }}>
                    {brewery.brand}
                  </h2>
                  {isVisited && (
                    <div>
                      <span style={{ fontSize: '12px', color: '#b22222', fontWeight: 'bold' }}>● 参拝済み</span>
                      <p style={{ fontSize: '11px', color: '#666', margin: '2px 0 0', fontFamily: 'serif' }}>
                        令和七年 {visitDate} 参拝
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 下部リンクボタンエリア */}
              <div style={{ display: 'flex', gap: '15px', marginTop: 'auto', paddingTop: '15px', borderTop: '1px dashed #d4c4a8' }}>

              {/* 下部：リンクボタンエリア（横並び） */}
              <div style={{ 
                display: 'flex', 
                gap: '15px', 
                marginTop: 'auto', // 下揃えにする
                paddingTop: '15px',
                borderTop: '1px dashed #d4c4a8' // 区切り線
              }}>
                
                {/* 🌐 公式サイトボタン */}
                {brewery.url ? (
                  <a href={brewery.url} target="_blank" rel="noopener noreferrer"
                    style={linkButtonStyle(isVisited)}
                    title="公式サイトへ"
                  >
                    <span>🌐</span> 
                  </a>
                ) : (
                  <div style={{ ...linkButtonStyle(false), opacity: 0.3, cursor: 'not-allowed' }} title="公式サイトなし">🌐</div>
                )}

                {/* 📱 SNSボタン */}
                {brewery.SNS ? (
                  <a href={brewery.SNS} target="_blank" rel="noopener noreferrer"
                    style={linkButtonStyle(isVisited)}
                    title="SNSへ"
                  >
                    <span>📱</span>
                  </a>
                ) : (
                  <div style={{ ...linkButtonStyle(false), opacity: 0.3, cursor: 'not-allowed' }} title="SNSなし">📱</div>
                )}

                {/* 📍 GoogleMapボタン */}
                <button onClick={() => handleAddressClick(brewery.address)}
                  style={{...linkButtonStyle(isVisited), cursor: 'pointer'}}
                  title="Google Mapsで場所を確認"
                >
                  <span>📍</span>
                </button>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}