// components/HamburgerMenu.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import styles from './HamburgerMenu.module.css';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // 環境変数を取得（デバッグ用に一度変数に入れる）
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // クライアントの初期化をメモ化し、値がある時だけ実行する
  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      return null; // まだ準備ができていない場合はnullを返す
    }
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }, [supabaseUrl, supabaseAnonKey]);

  useEffect(() => {
    setMounted(true);
    
    // supabaseがnullなら何もしない
    if (!supabase) return;

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Googleサインイン処理
  const handleLogin = async () => {
    if (!supabase) {
      alert("認証の準備ができていません。ページをリロードしてください。");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // サインアウト処理
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
      closeMenu();
    }
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