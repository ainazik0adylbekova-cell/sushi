/**
 * Данные филиалов «Суши Жейм» по Чуйской области
 * 
 * ВАЖНО: Используйте реальные координаты для производства!
 * Текущие координаты - примерные для демонстрации.
 */

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone?: string;
  workingHours?: string;
  isMain?: boolean;
}

export const BRANCHES: Branch[] = [
  {
    id: "1",
    name: "Суши Жейм - Центр",
    address: "пр. Чуй 123, Бишкек",
    city: "Бишкек",
    lat: 42.8746,
    lng: 74.5698,
    phone: "+996 505 255 444",
    workingHours: "10:00 - 23:00",
    isMain: true,
  },
  {
    id: "2",
    name: "Суши Жейм - Ала-Арча",
    address: "ул. Ала-Арча 45, Бишкек",
    city: "Бишкек",
    lat: 42.8846,
    lng: 74.5798,
    phone: "+996 505 255 444",
    workingHours: "10:00 - 23:00",
  },
  {
    id: "3",
    name: "Суши Жейм - Раззакова",
    address: "ул. Раззакова 12, Бишкек",
    city: "Бишкек",
    lat: 42.8646,
    lng: 74.5898,
    phone: "+996 505 255 444",
    workingHours: "10:00 - 23:00",
  },
  {
    id: "4",
    name: "Суши Жейм - Токтогула",
    address: "ул. Токтогула 67, Бишкек",
    city: "Бишкек",
    lat: 42.8946,
    lng: 74.5598,
    phone: "+996 505 255 444",
    workingHours: "10:00 - 23:00",
  },
  {
    id: "5",
    name: "Суши Жейм - Ибраимова",
    address: "ул. Ибраимова 89, Бишкек",
    city: "Бишкек",
    lat: 42.8746,
    lng: 74.5998,
    phone: "+996 505 255 444",
    workingHours: "10:00 - 23:00",
  },
  {
    id: "6",
    name: "Суши Жейм - Юнусалиева",
    address: "ул. Юнусалиева 34, Бишкек",
    city: "Бишкек",
    lat: 42.8546,
    lng: 74.5498,
    phone: "+996 505 255 444",
    workingHours: "10:00 - 23:00",
  },
  {
    id: "7",
    name: "Суши Жейм - Манас",
    address: "пр. Манаса 56, Бишкек",
    city: "Бишкек",
    lat: 42.8846,
    lng: 74.5398,
    phone: "+996 505 255 444",
    workingHours: "10:00 - 23:00",
  },
  {
    id: "8",
    name: "Суши Жейм - Восток-5",
    address: "мкр. Восток-5, Бишкек",
    city: "Бишкек",
    lat: 42.8446,
    lng: 74.6198,
    phone: "+996 505 255 444",
    workingHours: "10:00 - 23:00",
  },
  {
    id: "9",
    name: "Суши Жейм - Джал",
    address: "мкр. Джал, Бишкек",
    city: "Бишкек",
    lat: 42.8346,
    lng: 74.5298,
    phone: "+996 505 255 444",
    workingHours: "10:00 - 23:00",
  },
  {
    id: "10",
    name: "Суши Жейм - Аламедин-1",
    address: "мкр. Аламедин-1, Бишкек",
    city: "Бишкек",
    lat: 42.8146,
    lng: 74.5498,
    phone: "+996 505 255 444",
    workingHours: "10:00 - 23:00",
  },
  {
    id: "11",
    name: "Суши Жейм - Кок-Жар",
    address: "мкр. Кок-Жар, Бишкек",
    city: "Бишкек",
    lat: 42.9046,
    lng: 74.5198,
    phone: "+996 505 255 444",
    workingHours: "10:00 - 23:00",
  },
  {
    id: "12",
    name: "Суши Жейм - Асанбай",
    address: "мкр. Асанбай, Бишкек",
    city: "Бишкек",
    lat: 42.9146,
    lng: 74.5798,
    phone: "+996 505 255 444",
    workingHours: "10:00 - 23:00",
  },
  {
    id: "13",
    name: "Суши Жейм - Кара-Жыгач",
    address: "мкр. Кара-Жыгач, Бишкек",
    city: "Бишкек",
    lat: 42.8046,
    lng: 74.5098,
    phone: "+996 505 255 444",
    workingHours: "10:00 - 23:00",
  },
];

/**
 * Получить координаты центра для отображения всех филиалов
 */
export function getBranchesCenter(): { lat: number; lng: number } {
  const avgLat = BRANCHES.reduce((sum, b) => sum + b.lat, 0) / BRANCHES.length;
  const avgLng = BRANCHES.reduce((sum, b) => sum + b.lng, 0) / BRANCHES.length;
  return { lat: avgLat, lng: avgLng };
}

/**
 * Получить границы (bounds) для отображения всех филиалов
 */
export function getBranchesBounds(): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const lats = BRANCHES.map(b => b.lat);
  const lngs = BRANCHES.map(b => b.lng);
  
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
}
