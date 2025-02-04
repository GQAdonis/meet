'use client';

export default function Footer() {
    return (
      <footer className="bg-black/70 text-white py-6 text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} SkyTok. All rights reserved.</p>
      </footer>
    );
  }  