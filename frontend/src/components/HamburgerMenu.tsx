// components/HamburgerMenu.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './HamburgerMenu.module.css';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
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