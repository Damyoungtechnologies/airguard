import React from 'react';
import Header from './Header';
import MainContent from './MainContent';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
}
