// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BreweryMap from '@/components/BreweryMap';
import HamburgerMenu from '@/components/HamburgerMenu';
import { getCheckIns } from '@/lib/checkin';

type Brewery = {
  id?: string; // IDを追加しておくと便利です
  name: string;
  latitude: number;
  longitude: number;
  url?: string; // 追加
  sns?: string; // 追加
};

type UserLocation = {
  lat: number;
  lng: number;
};

export default function Home() {
  const [breweries, setBreweries] = useState<Brewery[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [checkinCount, setCheckinCount] = useState(0);

  useEffect(() => {
    // 非同期で取得するための関数を定義
    const loadCount = async () => {
      try {
        const records = await getCheckIns(); // ここで await を使って取得を待つ
        setCheckinCount(records.length);     // 取得できた配列の件数をセット
      } catch (err) {
        console.error("履歴の取得に失敗:", err);
      }
    };

    loadCount();
  }, []);

  useEffect(() => {
    fetch('/api/breweries')
      .then(res => res.json())
      .then(data => {
        const valid = data
          .map((b: any, i: number) => ({
            id: b.id,
            name: b.brand || b.name || `不明${i}`,
            latitude: Number(b.lat),
            longitude: Number(b.lng),
            url: b.url,
            sns: b.sns,
          }))
          .filter((b: Brewery) => !isNaN(b.latitude) && !isNaN(b.longitude));
        setBreweries(valid);
      });
  }, []);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setUserLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #f4f1ea 0%, #fafafa 100%)',
        fontFamily:
          '"Noto Serif JP", "Sawarabi Mincho", serif',
        color: '#2c2c2c',
      }}
    >
      <HamburgerMenu />

      {/* ===== Hero ===== */}
      <header
        style={{
          textAlign: 'center',
          padding: '72px 20px 56px',
          background:
            'linear-gradient(135deg, #ec660dff, #d4d485ff)',
          color: 'white',
        }}
      >
        <div 
          style={{ 
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img 
            src="/beerHenro_logo.png" 
            alt="麦酒遍路" 
            style={{
              maxWidth: '300px',
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </div>
        <p style={{ opacity: 0.9, marginBottom: '32px' }}>
          🍺 四国のクラフトブルワリーを巡る旅
        </p>
        
        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/map"
            style={{
              padding: '16px 36px',
              backgroundColor: '#ff652f',
              color: 'white',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '18px',
              textDecoration: 'none',
              boxShadow:
                '0 8px 24px rgba(0,0,0,0.25)',
            }}
          >
            チェックインする
          </Link>

          <Link
            href="/breweries"
            style={{
              padding: '16px 36px',
              border: '2px solid rgba(255,255,255,0.8)',
              borderRadius: '999px',
              color: 'white',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            御朱印帳
          </Link>
        </div>
      </header>

      {/* ===== Stats ===== */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '48px auto',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(200px,1fr))',
            gap: '24px',
          }}
        >
          {[
            { label: '登録ブルワリー', value: breweries.length, color: '#ff6f2dff' },
            { label: 'チェックイン数', value: checkinCount, color: '#27ae60' },
            { 
              label: '達成率', 
              value: breweries.length > 0 ? `${Math.round((checkinCount / breweries.length) * 100)}%` : '0%', 
              color: '#3498db' 
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                padding: '18px',
                borderRadius: '999px',
                textAlign: 'center',
                boxShadow:
                  '0 8px 24px rgba(0,0,0,0.08)',
              }}
            >
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: s.color,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  marginTop: '8px',
                  color: '#666',
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== About ===== */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto 56px',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow:
              '0 8px 24px rgba(0,0,0,0.08)',
          }}
        >
          <h2
            style={{
              fontSize: '28px',
              marginBottom: '20px',
            }}
          >
            麦酒遍路とは
          </h2>

          <p
            style={{
              maxWidth: '720px',
              lineHeight: 1.9,
              color: '#555',
            }}
          >
            四国4県に点在するクラフトブルワリーを巡る旅路。
            チェックイン機能で訪問記録を残しながら、
            ビールと土地の文化を味わう体験型マップです。
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(240px,1fr))',
              gap: '24px',
              marginTop: '32px',
            }}
          >
            {[
              { icon: '🗺️', title: 'マップ', text: '現在地からルート表示' },
              { icon: '✅', title: 'チェックイン', text: '近づくと記録可能' },
              { icon: '📖', title: '御朱印帳', text: '訪問履歴を一覧管理' },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  background: '#fafafa',
                  padding: '24px',
                  borderRadius: '999px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '28px' }}>
                  {f.icon}
                </div>
                <h3 style={{ margin: '8px 0' }}>
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#666',
                  }}
                >
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Map ===== */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto 72px',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow:
              '0 8px 24px rgba(0,0,0,0.08)',
          }}
        >
          <h2
            style={{
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            マップ
          </h2>
          <BreweryMap
            breweries={breweries}
            userLocation={userLocation}
          />
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer
        style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: '#313131ff',
          fontSize: '13px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <img 
          src="/icon_hop.png" 
          alt="ホップ" 
          style={{
            width: '40px',
            height: '40px',
            opacity: 0.8,
          }}
        />
        <p style={{ margin: 0 }}>© 2025 麦酒遍路</p>
      </footer>
    </div>
  );
}