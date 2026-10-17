"use client";

import { Clock, RefreshCw, ShieldCheck, Sparkles, Truck, Smartphone } from "lucide-react";
import { useState } from "react";
import { useLang } from "../../providers/LanguageProvider";

export default function Features() {
  const { t } = useLang();

  const features = [
    { 
      Icon: Clock, 
      title: t.feat1Title, 
      desc: t.feat1Desc, 
      gradient: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
      iconBg: "rgba(255, 107, 107, 0.2)",
      glowColor: "rgba(255, 107, 107, 0.4)",
    },
    { 
      Icon: RefreshCw, 
      title: t.feat2Title, 
      desc: t.feat2Desc, 
      gradient: "linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)",
      iconBg: "rgba(79, 172, 254, 0.2)",
      glowColor: "rgba(79, 172, 254, 0.4)",
    },
    { 
      Icon: ShieldCheck, 
      title: t.feat3Title, 
      desc: t.feat3Desc, 
      gradient: "linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)",
      iconBg: "rgba(67, 233, 123, 0.2)",
      glowColor: "rgba(67, 233, 123, 0.4)",
    },
    { 
      Icon: Sparkles, 
      title: t.feat4Title, 
      desc: t.feat4Desc, 
      gradient: "linear-gradient(135deg, #FA709A 0%, #FEE140 100%)",
      iconBg: "rgba(250, 112, 154, 0.2)",
      glowColor: "rgba(250, 112, 154, 0.4)",
    },
    { 
      Icon: Truck, 
      title: t.feat5Title, 
      desc: t.feat5Desc, 
      gradient: "linear-gradient(135deg, #F093FB 0%, #F5576C 100%)",
      iconBg: "rgba(240, 147, 251, 0.2)",
      glowColor: "rgba(240, 147, 251, 0.4)",
    },
    { 
      Icon: Smartphone, 
      title: t.feat6Title, 
      desc: t.feat6Desc, 
      gradient: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
      iconBg: "rgba(102, 126, 234, 0.2)",
      glowColor: "rgba(102, 126, 234, 0.4)",
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-20" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-5">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--brand)" }}>
            {t.featSubtitle}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-5 px-4" style={{ color: "var(--fg)" }}>
            {t.featTitle}
          </h2>
          <p className="text-base sm:text-lg max-w-2xl mx-auto px-4" style={{ color: "var(--fg-muted)" }}>
            Мы создаем незабываемый опыт с каждым заказом
          </p>
        </div>

        {/* 3D Glass Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature, idx) => (
            <GlassCard key={idx} feature={feature} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GlassCard({ feature, index }: { feature: any; index: number }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      className="glass-card-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <div
        className="glass-card"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(20px)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        {/* Glass overlay */}
        <div className="glass-card__glass" />
        
        {/* Gradient border */}
        <div 
          className="glass-card__border" 
          style={{ background: feature.gradient }}
        />

        {/* Glow effect on hover */}
        <div 
          className="glass-card__glow"
          style={{ 
            boxShadow: `0 0 60px ${feature.glowColor}, 0 0 100px ${feature.glowColor}`,
          }}
        />
        
        {/* Content */}
        <div className="glass-card__content">
          {/* Icon with concentric circles */}
          <div className="glass-card__icon-wrapper">
            <span className="glass-card__circle glass-card__circle--1" style={{ borderColor: feature.glowColor }} />
            <span className="glass-card__circle glass-card__circle--2" style={{ borderColor: feature.glowColor }} />
            <span className="glass-card__circle glass-card__circle--3" style={{ borderColor: feature.glowColor }} />
            <span className="glass-card__circle glass-card__circle--4" style={{ borderColor: feature.glowColor }} />
            <div 
              className="glass-card__icon"
              style={{ 
                background: feature.iconBg,
                boxShadow: `0 0 20px ${feature.glowColor}`,
              }}
            >
              <feature.Icon className="glass-card__icon-svg" style={{ color: "var(--brand)" }} />
            </div>
          </div>

          {/* Text */}
          <h3 className="glass-card__title">{feature.title}</h3>
          <p className="glass-card__desc">{feature.desc}</p>

          {/* Decorative gradient blobs */}
          <div 
            className="glass-card__deco glass-card__deco--1" 
            style={{ background: `radial-gradient(circle, ${feature.glowColor} 0%, transparent 70%)` }}
          />
          <div 
            className="glass-card__deco glass-card__deco--2" 
            style={{ background: `radial-gradient(circle, ${feature.glowColor} 0%, transparent 70%)` }}
          />
        </div>
      </div>

      <style jsx>{`
        .glass-card-wrapper {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
          from {
            opacity: 0;
            transform: translateY(20px);
          }
        }

        .glass-card {
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 32px 24px;
          min-height: 240px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transform-style: preserve-3d;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .glass-card__glass {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(180deg, 
            rgba(255, 255, 255, 0.12) 0%, 
            rgba(255, 255, 255, 0) 100%
          );
          border-radius: 24px 24px 0 0;
          pointer-events: none;
        }

        .glass-card__border {
          position: absolute;
          inset: -2px;
          border-radius: 24px;
          padding: 2px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.6;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .glass-card__glow {
          position: absolute;
          inset: -20px;
          border-radius: 24px;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: -1;
        }

        .glass-card:hover .glass-card__glow {
          opacity: 0.3;
        }

        .glass-card__content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .glass-card__icon-wrapper {
          position: relative;
          width: 64px;
          height: 64px;
          margin-bottom: 8px;
        }

        .glass-card__circle {
          position: absolute;
          border-radius: 50%;
          border-width: 2px;
          border-style: solid;
        }

        .glass-card__circle--1 {
          inset: 0;
          animation: pulse 3s ease-in-out infinite;
        }

        .glass-card__circle--2 {
          inset: -10px;
          animation: pulse 3s ease-in-out infinite 0.5s;
        }

        .glass-card__circle--3 {
          inset: -20px;
          animation: pulse 3s ease-in-out infinite 1s;
        }

        .glass-card__circle--4 {
          inset: -30px;
          animation: pulse 3s ease-in-out infinite 1.5s;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        .glass-card__icon {
          position: relative;
          z-index: 1;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-center;
          border: none;
          transition: all 0.3s ease;
        }

        .glass-card__icon-svg {
          width: 32px;
          height: 32px;
        }

        .glass-card:hover .glass-card__icon {
          transform: scale(1.15) translateZ(10px);
        }

        .glass-card__title {
          font-size: 20px;
          font-weight: 700;
          color: var(--fg);
          line-height: 1.3;
        }

        .glass-card__desc {
          font-size: 15px;
          color: var(--fg-muted);
          line-height: 1.6;
        }

        .glass-card__deco {
          position: absolute;
          border-radius: 50%;
          opacity: 0.2;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .glass-card__deco--1 {
          width: 120px;
          height: 120px;
          top: -30px;
          right: -30px;
        }

        .glass-card__deco--2 {
          width: 100px;
          height: 100px;
          bottom: -20px;
          left: -20px;
        }

        .glass-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.08);
        }

        .glass-card:hover .glass-card__border {
          opacity: 1;
        }

        .glass-card:hover .glass-card__deco {
          opacity: 0.4;
        }

        @media (max-width: 640px) {
          .glass-card {
            padding: 28px 20px;
            min-height: 220px;
          }
          
          .glass-card__icon-wrapper {
            width: 56px;
            height: 56px;
          }

          .glass-card__icon {
            width: 56px;
            height: 56px;
          }

          .glass-card__icon-svg {
            width: 28px;
            height: 28px;
          }

          .glass-card__title {
            font-size: 18px;
          }

          .glass-card__desc {
            font-size: 14px;
          }

          .glass-card__circle--2 {
            inset: -8px;
          }

          .glass-card__circle--3 {
            inset: -16px;
          }

          .glass-card__circle--4 {
            inset: -24px;
          }

          .glass-card__deco--1 {
            width: 90px;
            height: 90px;
            top: -20px;
            right: -20px;
          }

          .glass-card__deco--2 {
            width: 70px;
            height: 70px;
            bottom: -15px;
            left: -15px;
          }
        }

        @media (max-width: 480px) {
          .glass-card {
            padding: 24px 18px;
            min-height: 200px;
          }

          .glass-card__icon-wrapper {
            width: 48px;
            height: 48px;
            margin-bottom: 6px;
          }

          .glass-card__icon {
            width: 48px;
            height: 48px;
          }

          .glass-card__icon-svg {
            width: 24px;
            height: 24px;
          }

          .glass-card__title {
            font-size: 17px;
          }

          .glass-card__desc {
            font-size: 13px;
          }

          .glass-card__content {
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}
