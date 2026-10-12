'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCheckIns, type Brewery, type CheckInRecord } from "@/lib/checkin"; // CheckInRecordを追加
import HamburgerMenu from "@/components/HamburgerMenu";
import { useSession } from "next-auth/react";

// 住所から四国4県の県名を取得
const getPrefecture = (address: string): string => {
  const prefectures = ["香川県", "愛媛県", "高知県", "徳島県"];

  return prefectures.find((pref) => address.includes(pref)) ?? "その他";
};

// ボタンの共通スタイル定義
const linkButtonStyle = (isVisited: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: isVisited ? '#fff' : '#e0e0e0',
  border: `1px solid ${isVisited ? '#b22222' : '#999'}`,
  color: isVisited ? '#b22222' : '#999',
  fontSize: '16px',
  textDecoration: 'none',
  transition: '0.3s',
  boxShadow: '2px 2px 5px rgba(0,0,0,0.05)',
});

export default function BreweriesPage() {
  const { status, data: session } = useSession();
  const [breweries, setBreweries] = useState<Brewery[]>([]);
  const [checkInMap, setCheckInMap] = useState<Map<string, CheckInRecord>>(new Map());


  // ブルワリー一覧の取得
  useEffect(() => {
    fetch("/api/breweries")
      .then((res) => {
        if (!res.ok) throw new Error("ブルワリー一覧の取得に失敗しました");
        return res.json();
      })
      .then((data) => setBreweries(data))
      .catch((err) => console.error(err));
  }, []);

  // ログインユーザーごとのチェックイン履歴の取得
  useEffect(() => {
    let cancelled = false;

    const loadCheckIns = async () => {
      if (status === "loading") return;

      // 前のユーザーの履歴を消す
      setCheckInMap(new Map());

      // ログアウト中は履歴を取得しない
      if (status !== "authenticated") return;

      try {
        const records = await getCheckIns();

        if (!cancelled) {
          const map = new Map(
            records.map((r) => [r.breweryId, r] as const)
          );
          setCheckInMap(map);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("チェックイン履歴の取得に失敗:", err);
        }
      }
    };

    loadCheckIns();

    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id]);


  const handleAddressClick = (address: string) => {
    const confirmed = window.confirm(`Google Mapsで「${address}」を開きますか？`);
    if (!confirmed) return;
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank", "noopener,noreferrer");
  };


  // 四国4県の達成状況を集計
  const prefectures = ["香川県", "愛媛県", "高知県", "徳島県"];

  const prefectureStats = prefectures.map((prefecture) => {
    // この県にあるブルワリーを抽出
    const prefectureBreweries = breweries.filter(
      (brewery) => getPrefecture(brewery.address) === prefecture
    );

    // この県でチェックイン済みのブルワリー数
    const visited = prefectureBreweries.filter(
      (brewery) => checkInMap.has(brewery.id)
    ).length;

    return {
      prefecture,
      total: prefectureBreweries.length,
      visited,
    };
  });

  return (
    <div style={{
      padding: '40px 20px',
      backgroundColor: '#f4f1ea',
      minHeight: '100vh',
      fontFamily: '"Noto Serif JP", serif'
    }}>
      <HamburgerMenu />

      {/* ロゴエリア */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <Link href="/" aria-label="麦酒遍路のホームへ">
          <img
            src="/beerHenro_logo.png"
            alt="麦酒遍路"
            style={{ maxWidth: '200px', height: 'auto' }}
          />
        </Link>
      </div>


      <h1 style={{
        textAlign: 'center',
        fontSize: '28px',
        marginBottom: '40px',
        color: '#333',
        borderBottom: '2px solid #d4c4a8',
        display: 'block',
        paddingBottom: '10px'
      }}>
        御朱印帳
      </h1>

      {/* 県別の達成状況 */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '15px'
      }}>
        {prefectureStats.map((stat) => {
          const percentage = stat.total > 0
            ? Math.round((stat.visited / stat.total) * 100)
            : 0;

          return (
            <div key={stat.prefecture} style={{
              backgroundColor: '#fcfaf2',
              border: '1px solid #d4c4a8',
              borderRadius: '4px',
              padding: '20px'
            }}>
              <h2 style={{
                fontSize: '18px',
                color: '#333',
                margin: '0 0 10px'
              }}>
                {stat.prefecture}
              </h2>

              <p style={{
                color: '#b22222',
                fontSize: '20px',
                fontWeight: 'bold',
                margin: '0 0 10px'
              }}>
                {stat.visited} / {stat.total} 箇所
              </p>

              {/* 達成率のバー */}
              <div style={{
                height: '10px',
                backgroundColor: '#e0e0e0',
                borderRadius: '5px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${percentage}%`,
                  height: '100%',
                  backgroundColor: '#b22222',
                  transition: 'width 0.3s'
                }} />
              </div>

              <p style={{
                textAlign: 'right',
                fontSize: '12px',
                color: '#666',
                margin: '8px 0 0'
              }}>
                達成率 {percentage}%
              </p>
            </div>
          );
        })}
      </div>


      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {breweries.map((brewery) => {
          const record = checkInMap.get(brewery.id);
          const isVisited = !!record;

          // 参拝日のフォーマット（令和・漢数字表記）
          let reiwaDisplay = "";
          if (record?.createdAt) {
            const d = new Date(record.createdAt);
            const westernYear = d.getFullYear();
            const yearNum = westernYear - 2018; // 令和の計算

            // 漢数字に変換するための設定
            const kanjiFormatter = new Intl.DateTimeFormat('ja-JP-u-ca-japanese-nu-hanidec', {
              month: 'long',
              day: 'numeric',
            });

            // 年の漢数字（1は「元」にする処理）
            const kanjiYear = yearNum === 1 ? "元" : new Intl.NumberFormat('ja-JP-u-nu-hanidec').format(yearNum);

            // 月日の漢数字（例：二月五日）
            const kanjiDate = kanjiFormatter.format(d);

            reiwaDisplay = `令和${kanjiYear}年 ${kanjiDate}`;
          }

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
              filter: isVisited ? 'none' : 'grayscale(60%) opacity(0.8)'
            }}>

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                {/* スタンプエリア */}
                <div style={{ minWidth: '80px', height: '80px', marginRight: '20px', position: 'relative' }}>
                  <img
                    src={brewery.stampUrl || "/Goshuin.png"}
                    alt="印"
                    style={{
                      width: '100%', height: '100%', objectFit: 'contain',
                      transition: '0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                      transform: isVisited ? 'rotate(-12deg) scale(1.1)' : 'rotate(0deg)',
                      opacity: isVisited ? 0.85 : 0.1,
                      filter: isVisited ? 'contrast(1.1) brightness(0.9)' : 'grayscale(100%)',
                    }}
                  />
                  {!isVisited && (
                    <span style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      fontSize: '10px', color: '#999', border: '1px solid #999', padding: '2px 4px',
                      whiteSpace: 'nowrap', backgroundColor: 'rgba(255,255,255,0.7)'
                    }}>
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
                      <span style={{ fontSize: '11px', color: '#b22222', fontWeight: 'bold', display: 'block' }}>
                        ● チェックイン済み
                      </span>
                      <p style={{ fontSize: '11px', color: '#666', margin: '2px 0 0', fontFamily: 'serif' }}>
                        {reiwaDisplay} 参拝
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 下部リンクボタンエリア */}
              <div style={{
                display: 'flex',
                gap: '15px',
                marginTop: 'auto',
                paddingTop: '15px',
                borderTop: '1px dashed #d4c4a8'
              }}>
                {/* 🌐 公式サイト */}
                {brewery.url ? (
                  <a href={brewery.url} target="_blank" rel="noopener noreferrer"
                    style={linkButtonStyle(isVisited)} title="公式サイトへ">
                    <span>🌐</span>
                  </a>
                ) : (
                  <div style={{ ...linkButtonStyle(false), opacity: 0.3 }} title="なし">🌐</div>
                )}

                {/* 📱 SNS */}
                {brewery.SNS ? (
                  <a href={brewery.SNS} target="_blank" rel="noopener noreferrer"
                    style={linkButtonStyle(isVisited)} title="SNSへ">
                    <span>📱</span>
                  </a>
                ) : (
                  <div style={{ ...linkButtonStyle(false), opacity: 0.3 }} title="なし">📱</div>
                )}

                {/* 📍 GoogleMap */}
                <button onClick={() => handleAddressClick(brewery.address)}
                  style={{ ...linkButtonStyle(isVisited), cursor: 'pointer' }}
                  title="Google Mapsを確認">
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