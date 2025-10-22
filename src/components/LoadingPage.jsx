import React, { useState, useEffect } from 'react';
import inflowwLogo from '../assets/infloww_logo.png';
import appLogo from '../assets/app-logo/logo.png';
import './LoadingPage.css';

const LoadingPage = ({ onComplete }) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [activeDot, setActiveDot] = useState(0);
  const [showWhiteFlash, setShowWhiteFlash] = useState(false);

  useEffect(() => {
    // phase 0: infloww logo growing (2 seconds)
    const phase0Timer = setTimeout(() => {
      setAnimationPhase(1);
    }, 2000);

    // phase 1: app logo with dots animation
    const phase1Timer = setTimeout(() => {
        setAnimationPhase(2);
        setShowWhiteFlash(true);
    }, 3000);

    // phase 2: white transition (0.5 seconds)
    const phase2Timer = setTimeout(() => {
      setAnimationPhase(1);
      setShowWhiteFlash(false);
    }, 3500);

    return () => {
      clearTimeout(phase0Timer);
      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);
    };
  }, []); // empty dependency array so it only runs once

  useEffect(() => {
    // complete loading after one full cycle
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(completeTimer);
  }, [onComplete]);

  useEffect(() => {
    if (animationPhase === 1) {
      const dotInterval = setInterval(() => {
        setActiveDot(prev => (prev + 1) % 3);
      }, 300);
      return () => clearInterval(dotInterval);
    }
  }, [animationPhase]);

  console.log(showWhiteFlash);

  if (showWhiteFlash) {
    return (
      <div className="loading-page white-transition">
      </div>
    );
  }

  return (
    <div className="loading-page">
      {animationPhase === 0 && (
        <div className="phase-0">
          <img
            src={inflowwLogo}
            alt="Infloww Logo"
            className="infloww-logo-growing"
          />
        </div>
      )}

      {animationPhase === 1 && (
        <div className="phase-1">
          <img
            src={appLogo}
            alt="App Logo"
            className="app-logo-static"
          />
          <div className="dots-container">
            <div className={`dot ${activeDot === 0 ? 'active' : activeDot === 1 ? 'trailing' : 'behind'}`}></div>
            <div className={`dot ${activeDot === 1 ? 'active' : activeDot === 2 ? 'trailing' : 'behind'}`}></div>
            <div className={`dot ${activeDot === 2 ? 'active' : activeDot === 0 ? 'trailing' : 'behind'}`}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingPage;
