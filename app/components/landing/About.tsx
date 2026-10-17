"use client";

import { Clock, Truck, Star, ChefHat, Award, Heart } from "lucide-react";
import { useState } from "react";

export default function About() {
  const features = [
    { 
      Icon: Clock, 
      title: "Быстрая доставка", 
      desc: "40-60 минут по всему Бишкеку",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      iconBg: "rgba(102, 126, 234, 0.15)",
    },
    { 
      Icon: ChefHat, 
      title: "Свежие продукты", 
      desc: "Только качественные ингредиенты",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      iconBg: "rgba(240, 147, 251, 0.15)",
    },
    { 
      Icon: Star, 
      title: "200+ блюд", 
      desc: "Большое разнообразие в меню",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      iconBg: "rgba(79, 172, 254, 0.15)",
    },
    { 
      Icon: Truck, 
      title: "Бесплатная доставка", 
      desc: "При заказе от 1200 сом",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      iconBg: "rgba(67, 233, 123, 0.15)",
    },
    { 
      Icon: Award, 
      title: "Гарантия качества", 
      desc: "Контроль на каждом этапе",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      iconBg: "rgba(250, 112, 154, 0.15)",
    },
    { 
      Icon: Heart, 
      title: "С любовью", 
      desc: "Готовим как для себя",
      gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
      iconBg: "rgba(255, 107, 107, 0.15)",
    },
  ];

  return (
    <section id="about" className="py-20" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--brand)" }}>
            О нас
          </p>
          <h2 className="text-4xl sm:text-5xl font-black mb-5" style={{ color: "var(--fg)" }}>
            Почему выбирают нас
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--fg-muted)" }}>
            Мы создаем незабываемый опыт с каждым заказом
          </p>
        </div>

        {/* 3D Glass Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        
        {/* Content */}
        <div className="glass-card__content">
          {/* Icon with concentric circles */}
          <div className="glass-card__icon-wrapper">
            <span className="glass-card__circle glass-card__circle--1" />
            <span className="glass-card__circle glass-card__circle--2" />
            <span className="glass-card__circle glass-card__circle--3" />
            <span className="glass-card__circle glass-card__circle--4" />
            <div className="glass-card__icon">
              <feature.Icon className="w-6 h-6" style={{ color: "var(--brand)" }} />
            </div>
          </div>

          {/* Text */}
          <h3 className="glass-card__title">{feature.title}</h3>
          <p className="glass-card__desc">{feature.desc}</p>

          {/* Decorative elements */}
          <div className="glass-card__deco glass-card__deco--1" />
          <div className="glass-card__deco glass-card__deco--2" />
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
          background: rgba(255, 255, 255, 0.03);
          border-radius: 24px;
          padding: 32px 24px;
          min-height: 240px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transform-style: preserve-3d;
          cursor: pointer;
          overflow: hidden;
        }

        .glass-card__glass {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(180deg, 
            rgba(255, 255, 255, 0.08) 0%, 
            rgba(255, 255, 255, 0) 100%
          );
          border-radius: 24px 24px 0 0;
          pointer-events: none;
        }

        .glass-card__border {
          position: absolute;
          inset: -1px;
          border-radius: 24px;
          padding: 1px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.5;
          pointer-events: none;
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
          width: 56px;
          height: 56px;
          margin-bottom: 8px;
        }

        .glass-card__circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-card__circle--1 {
          inset: 0;
          animation: pulse 3s ease-in-out infinite;
        }

        .glass-card__circle--2 {
          inset: -8px;
          animation: pulse 3s ease-in-out infinite 0.5s;
        }

        .glass-card__circle--3 {
          inset: -16px;
          animation: pulse 3s ease-in-out infinite 1s;
        }

        .glass-card__circle--4 {
          inset: -24px;
          animation: pulse 3s ease-in-out infinite 1.5s;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.95); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        .glass-card__icon {
          position: relative;
          z-index: 1;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-card__title {
          font-size: 18px;
          font-weight: 700;
          color: var(--fg);
          line-height: 1.3;
        }

        .glass-card__desc {
          font-size: 14px;
          color: var(--fg-muted);
          line-height: 1.5;
        }

        .glass-card__deco {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, var(--brand) 0%, transparent 70%);
          opacity: 0.15;
          pointer-events: none;
        }

        .glass-card__deco--1 {
          width: 100px;
          height: 100px;
          top: -20px;
          right: -20px;
        }

        .glass-card__deco--2 {
          width: 80px;
          height: 80px;
          bottom: -10px;
          left: -10px;
        }

        .glass-card:hover {
          border-color: rgba(255, 255, 255, 0.15);
        }

        .glass-card:hover .glass-card__border {
          opacity: 0.8;
        }

        @media (max-width: 640px) {
          .glass-card {
            padding: 24px 20px;
            min-height: 200px;
          }
          
          .glass-card__icon-wrapper {
            width: 48px;
            height: 48px;
          }

          .glass-card__icon {
            width: 48px;
            height: 48px;
          }

          .glass-card__title {
            font-size: 16px;
          }

          .glass-card__desc {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
