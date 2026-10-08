// components/HamburgerMenu.tsx
'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from './HamburgerMenu.module.css';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  // NextAuthのログイン状態を取得
  const { data: session, status } = useSession();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Googleログイン
  const handleLogin = async () => {
    await signIn('google', {
      callbackUrl: '/',
    });
  };

  // ログアウト
  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/',
    });
    closeMenu();
  };

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
        <Link href="/" onClick={closeMenu}>
          ホーム
        </Link>

        <Link href="/map/" onClick={closeMenu}>
          ブルワリーマップ
        </Link>

        <Link href="/breweries/" onClick={closeMenu}>
          麦酒御朱印帳
        </Link>

        <a
          href="https://www.instagram.com/beer_ohenro/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={closeMenu}
        >
          お問い合わせ
        </a>

        {/* 認証セクション */}
        <div
          className={styles.authSection}
          style={{ marginTop: 'auto', padding: '20px 0' }}
        >
          {status === 'loading' ? (
            <p>読み込み中...</p>
          ) : session ? (
            <div className={styles.userInfo}>
              {/* プロフィール画像 */}
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="プロフィール画像"
                  width={40}
                  height={40}
                  style={{
                    borderRadius: '50%',
                    display: 'block',
                    marginBottom: '8px',
                  }}
                />
              )}

              {/* ユーザー名 */}
              <p
                style={{
                  fontSize: '14px',
                  marginBottom: '4px',
                }}
              >
                {session.user?.name}
              </p>

              {/* メールアドレス */}
              <p
                style={{
                  fontSize: '12px',
                  marginBottom: '8px',
                  color: '#666',
                }}
              >
                {session.user?.email}
              </p>

              {/* ログアウト */}
              <button
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                ログアウト
              </button>
            </div>
          ) : (
            <button onClick={handleLogin}>
              Googleでログイン
            </button>
          )}
        </div>
      </nav>

      {/* メニュー外をクリックしたら閉じる */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={closeMenu}
        />
      )}
    </>
  );
}