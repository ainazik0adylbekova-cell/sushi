"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Phone, Clock, Navigation, AlertCircle } from "lucide-react";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import { BRANCHES, type Branch } from "@/lib/branches";

export default function BranchesPage() {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const mapInitialized = useRef(false);

  // Загрузка 2GIS API
  useEffect(() => {
    if (typeof window === "undefined") return;

    console.log("🚀 Начало загрузки 2GIS API...");

    // Функция для проверки и инициализации DG
    const initializeDG = () => {
      const DG = (window as any).DG;
      
      console.log("🔍 Проверка DG...");
      console.log("Тип DG:", typeof DG);
      
      if (!DG) {
        console.error("❌ DG не определён (undefined)");
        setMapError("API 2GIS не загрузился");
        return false;
      }

      // Если DG - функция (промис-loader)
      if (typeof DG === "function") {
        console.log("✅ DG - это функция-промис");
        DG.then(() => {
          console.log("✅ API инициализирован через промис");
          setMapLoaded(true);
        }).catch((err: Error) => {
          console.error("❌ Ошибка промиса:", err);
          setMapError(`Ошибка: ${err.message}`);
        });
        return true;
      }

      // Если DG - объект (уже готовый API)
      if (typeof DG === "object") {
        console.log("✅ DG - это объект");
        if (typeof DG.map === "function") {
          console.log("✅ DG.map доступен, API готов!");
          setMapLoaded(true);
          return true;
        } else {
          console.error("❌ DG.map не найден:", Object.keys(DG));
          setMapError("DG.map отсутствует");
          return false;
        }
      }

      console.error("❌ Неизвестный тип DG:", typeof DG);
      setMapError("Неизвестный формат API");
      return false;
    };

    // Проверяем, не загружен ли уже
    const existing = document.querySelector('script[src*="maps.api.2gis.ru"]');
    if (existing && (window as any).DG) {
      console.log("📦 Скрипт уже был загружен ранее");
      initializeDG();
      return;
    }

    // Загружаем скрипт
    console.log("📥 Создаём тег <script>...");
    const script = document.createElement("script");
    script.src = "https://maps.api.2gis.ru/2.0/loader.js?pkg=full";
    script.async = true;
    script.charset = "utf-8";
    
    script.onload = () => {
      console.log("✅ Скрипт загружен успешно!");
      
      // Небольшая задержка для инициализации
      setTimeout(() => {
        initializeDG();
      }, 100);
    };

    script.onerror = (err) => {
      console.error("❌ ОШИБКА загрузки скрипта:", err);
      console.error("URL:", script.src);
      setMapError("Не удалось загрузить 2GIS. Проверьте интернет или попробуйте позже.");
    };

    console.log("➕ Добавляем скрипт в <head>...");
    document.head.appendChild(script);

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Инициализация карты
  useEffect(() => {
    if (!mapLoaded || typeof window === "undefined" || mapInitialized.current) return;

    const DG = (window as any).DG;
    if (!DG || typeof DG.map !== "function") {
      console.error("DG.map не доступен:", DG);
      setMapError("Карта не готова к инициализации");
      return;
    }

    const mapContainer = document.getElementById("map");
    if (!mapContainer) {
      console.error("Контейнер карты не найден");
      return;
    }

    console.log("Инициализация карты 2GIS...");

    try {
      // Создаём карту - ВАЖНО: 2GIS использует [lat, lng], не [lng, lat]!
      const map = DG.map("map", {
        center: [42.8746, 74.5698], // [lat, lng] - Центр Бишкека
        zoom: 11,
      });

      mapRef.current = map;
      mapInitialized.current = true;

      console.log("Карта создана, добавляем маркеры...");

      // Добавляем маркеры для всех филиалов
      const markers: any[] = [];
      
      BRANCHES.forEach((branch, index) => {
        console.log(`Добавление маркера ${index + 1}:`, branch.name, `[${branch.lat}, ${branch.lng}]`);
        
        // ВАЖНО: 2GIS использует [lat, lng]
        const marker = DG.marker([branch.lat, branch.lng], {
          icon: DG.icon({
            iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23f97316' stroke='white' stroke-width='1.5'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          }),
        }).addTo(map);

        // Создаём popup с информацией о филиале
        const popupContent = `
          <div style="padding: 12px; min-width: 200px;">
            <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: bold; color: #111;">
              ${branch.name}
            </h3>
            <p style="margin: 0 0 6px; font-size: 13px; color: #666; display: flex; align-items: start; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>${branch.address}</span>
            </p>
            ${branch.phone ? `
              <p style="margin: 0 0 6px; font-size: 13px; color: #666; display: flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <a href="tel:${branch.phone.replace(/\s/g, '')}" style="color: #f97316; text-decoration: none;">${branch.phone}</a>
              </p>
            ` : ''}
            ${branch.workingHours ? `
              <p style="margin: 0 0 8px; font-size: 13px; color: #666; display: flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>${branch.workingHours}</span>
              </p>
            ` : ''}
            <a 
              href="https://go.2gis.com/eoD6o" 
              target="_blank" 
              rel="noopener noreferrer"
              style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #f97316; color: white; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600; margin-top: 4px;"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
              Открыть в 2ГИС
            </a>
          </div>
        `;

        marker.bindPopup(popupContent);
        markers.push(marker);

        // Обработчик клика на маркер
        marker.on("click", () => {
          setSelectedBranch(branch);
        });
      });

      console.log(`Добавлено маркеров: ${markers.length}`);

      // Подгоняем масштаб карты чтобы показать все маркеры
      if (markers.length > 0) {
        const group = DG.featureGroup(markers);
        map.fitBounds(group.getBounds(), { padding: [50, 50] });
        console.log("Масштаб карты подогнан под все маркеры");
      }

      console.log("Карта успешно инициализирована!");

    } catch (error) {
      console.error("Ошибка инициализации карты:", error);
      setMapError(`Ошибка отображения карты: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }, [mapLoaded]);

  // Обработчик клика на филиал в списке
  const handleBranchClick = (branch: Branch) => {
    setSelectedBranch(branch);
    
    if (mapRef.current && (window as any).DG) {
      try {
        // Перемещаем карту к выбранному филиалу
        mapRef.current.setView([branch.lat, branch.lng], 15, { animate: true });
      } catch (error) {
        console.error("Ошибка перемещения карты:", error);
      }
    }
  };

  return (
    <>
      <Header />
      
      <main className="pt-16 min-h-screen" style={{ background: "var(--bg)" }}>
        {/* Hero секция */}
        <section className="py-12 sm:py-16" style={{ background: "var(--bg-section)" }}>
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--brand)" }}>
                Филиалы
              </p>
              <h1 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "var(--fg)" }}>
                Наши филиалы по <span style={{ color: "var(--brand)" }}>Чуйской области</span>
              </h1>
              <p className="text-base sm:text-lg" style={{ color: "var(--fg-muted)" }}>
                13 филиалов «Суши Жейм» работают для вас каждый день с 10:00 до 23:00
              </p>
            </div>
          </div>
        </section>

        {/* Карта и список филиалов */}
        <section className="py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-5">
            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Список филиалов */}
              <div className="lg:col-span-1 space-y-3">
                <h2 className="text-xl font-bold mb-4" style={{ color: "var(--fg)" }}>
                  Выберите филиал
                </h2>
                
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {BRANCHES.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => handleBranchClick(branch)}
                      className="w-full text-left p-4 rounded-xl transition-all"
                      style={{
                        background: selectedBranch?.id === branch.id ? "var(--brand-light)" : "var(--bg-card)",
                        border: `2px solid ${selectedBranch?.id === branch.id ? "var(--brand)" : "var(--border)"}`,
                      }}
                      onMouseEnter={(e) => {
                        if (selectedBranch?.id !== branch.id) {
                          e.currentTarget.style.borderColor = "var(--brand)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedBranch?.id !== branch.id) {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <MapPin 
                          className="w-5 h-5 shrink-0 mt-0.5" 
                          style={{ color: selectedBranch?.id === branch.id ? "var(--brand)" : "var(--fg-muted)" }} 
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm mb-1" style={{ color: "var(--fg)" }}>
                            {branch.name}
                            {branch.isMain && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--brand)", color: "white" }}>
                                Главный
                              </span>
                            )}
                          </h3>
                          <p className="text-xs mb-2" style={{ color: "var(--fg-muted)" }}>
                            {branch.address}
                          </p>
                          {branch.workingHours && (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--fg-muted)" }}>
                              <Clock className="w-3.5 h-3.5" />
                              <span>{branch.workingHours}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Карта */}
              <div className="lg:col-span-2">
                <div 
                  className="rounded-2xl overflow-hidden border"
                  style={{ 
                    background: "var(--bg-card)",
                    borderColor: "var(--border)",
                    height: "600px",
                    position: "relative",
                  }}
                >
                  {mapError ? (
                    <div className="w-full h-full flex items-center justify-center p-6" style={{ color: "var(--fg-muted)" }}>
                      <div className="text-center max-w-md">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--brand)" }} />
                        <h3 className="font-bold text-lg mb-2" style={{ color: "var(--fg)" }}>
                          Не удалось загрузить интерактивную карту
                        </h3>
                        <p className="text-sm mb-4">Но вы можете посмотреть наши филиалы в 2ГИС!</p>
                        
                        <div className="mb-4 p-4 rounded-lg" style={{ background: "var(--bg-section)" }}>
                          <p className="text-xs mb-3" style={{ color: "var(--fg-muted)" }}>
                            Используйте кнопки ниже, чтобы открыть карту с нашими филиалами:
                          </p>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                          <a
                            href="https://go.2gis.com/eoD6o"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base transition-all"
                            style={{ background: "var(--brand)", color: "white" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-hover)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand)")}
                          >
                            <Navigation className="w-5 h-5" />
                            Открыть все филиалы в 2ГИС
                          </a>
                          
                          <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 rounded-xl font-bold text-sm transition-all"
                            style={{ background: "var(--bg-section)", color: "var(--fg)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--border)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-section)")}
                          >
                            Попробовать загрузить карту снова
                          </button>
                        </div>
                        
                        <p className="text-xs mt-4" style={{ color: "var(--fg-muted)" }}>
                          Возможные причины: нет интернета, блокировщик рекламы, или проблемы с загрузкой API
                        </p>
                      </div>
                    </div>
                  ) : !mapLoaded ? (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--fg-muted)" }}>
                      <div className="text-center">
                        <div className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mb-3" style={{ borderColor: "var(--brand)" }} />
                        <p>Загрузка карты...</p>
                      </div>
                    </div>
                  ) : (
                    <div id="map" style={{ width: "100%", height: "100%" }} />
                  )}
                </div>

                {/* Информация о выбранном филиале */}
                {selectedBranch && (
                  <div 
                    className="mt-4 p-5 rounded-xl"
                    style={{ 
                      background: "var(--bg-card)",
                      border: "2px solid var(--brand)",
                    }}
                  >
                    <h3 className="font-bold text-lg mb-3" style={{ color: "var(--fg)" }}>
                      {selectedBranch.name}
                    </h3>
                    
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--brand)" }} />
                        <span className="text-sm" style={{ color: "var(--fg-sub)" }}>
                          {selectedBranch.address}
                        </span>
                      </div>

                      {selectedBranch.phone && (
                        <div className="flex items-center gap-2.5">
                          <Phone className="w-4 h-4 shrink-0" style={{ color: "var(--brand)" }} />
                          <a 
                            href={`tel:${selectedBranch.phone.replace(/\s/g, '')}`}
                            className="text-sm transition-colors"
                            style={{ color: "var(--fg-sub)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-sub)")}
                          >
                            {selectedBranch.phone}
                          </a>
                        </div>
                      )}

                      {selectedBranch.workingHours && (
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 shrink-0" style={{ color: "var(--brand)" }} />
                          <span className="text-sm" style={{ color: "var(--fg-sub)" }}>
                            {selectedBranch.workingHours}
                          </span>
                        </div>
                      )}

                      <a
                        href="https://go.2gis.com/eoD6o"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all mt-2"
                        style={{ background: "var(--brand)", color: "white" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand)")}
                      >
                        <Navigation className="w-4 h-4" />
                        Построить маршрут в 2ГИС
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
