// components/HamburgerMenu.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import styles from './HamburgerMenu.module.css';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false); // ハイドレーションエラー対策

  //ログイン処理
  // クライアントの初期化（Next.js 15対応）
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    setMounted(true);
    
    // 初回マウント時にユーザー取得
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // 状態変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Googleログイン処理
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    closeMenu();
  };

  // サーバーサイドレンダリングとの乖離を防ぐ
  if (!mounted) return null;
    

  return (
    <>
      {/* ハンバーガーボタン */}
      <button 
        className={`${styles.hamburger} ${isOpen ? styles.active : ''}`}
        onClick={toggleMenu}
        aria-label="メニュー"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* メニュー */}
      <nav className={`${styles.menu} ${isOpen ? styles.active : ''}`}>
        <Link href="/" onClick={closeMenu}>ホーム</Link>
        <Link href="/map/" onClick={closeMenu}>ブルワリーマップ</Link>
        <Link href="/breweries/" onClick={closeMenu}>麦酒御朱印帳</Link>
        <a 
          href="https://www.instagram.com/beer_ohenro/" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={closeMenu}
        >
          お問い合わせ
        </a>

        {/* 認証セクション */}
        <div className={styles.authSection} style={{ marginTop: 'auto', padding: '20px 0' }}>
          {user ? (
            <div className={styles.userInfo}>
              <p style={{ fontSize: '12px', marginBottom: '8px', color: '#666' }}>
                {user.email}
              </p>
              <button onClick={handleLogout} className={styles.logoutButton}>
                ログアウト
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className={styles.loginButton}>
              Googleでログイン
            </button>
          )}
        </div>

      </nav>

      {/* オーバーレイ（メニュー外をクリックしたら閉じる） */}
      {isOpen && (
        <div 
          className={styles.overlay} 
          onClick={closeMenu}
        />
      )}
    </>
  );
}