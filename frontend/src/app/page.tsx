// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BreweryMap from '@/components/BreweryMap';
import HamburgerMenu from '@/components/HamburgerMenu';

type Brewery = {
  name: string;
  latitude: number;
  longitude: number;
};

type UserLocation = {
  lat: number;
  lng: number;
};

export default function Home() {
  const [breweries, setBreweries] = useState<Brewery[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  // ブルワリーデータ取得
  useEffect(() => {
    fetch('http://localhost:8000/api/breweries')
      .then(res => res.json())
      .then(data => {
        const valid = data
          .map((b: any, i: number) => ({
            name: (b.brand || b.name || `不明${i}`) + `_${i}`,
            latitude: Number(b.lat),
            longitude: Number(b.lng),
          }))
          .filter(
            (b: Brewery) =>
              !isNaN(b.latitude) && !isNaN(b.longitude)
          );
        setBreweries(valid);
      });
  }, []);

  // 現在地取得
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
        <h1
          style={{
            fontSize: '52px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            marginBottom: '16px',
          }}
        >
          麦酒遍路
        </h1>
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
            マップを見る
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
            {
              label: '登録ブルワリー',
              value: breweries.length,
              color: '#ff6f2dff',
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                padding: '28px',
                borderRadius: '12px',
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
                  borderRadius: '12px',
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
            ブルワリーマップ
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
          color: '#999',
          fontSize: '13px',
        }}
      >
        © 2025 麦酒遍路
      </footer>
    </div>
  );
}
