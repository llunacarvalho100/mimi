import { WeatherSeasonState } from '../types';

export function calculateCurrentSeason(date = new Date(), isSouthernHemisphere = true): 'Primavera' | 'Verão' | 'Outono' | 'Inverno' {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  // For southern hemisphere (like Brazil - Guarulhos)
  if (isSouthernHemisphere) {
    if ((month === 8 && day >= 22) || month === 9 || month === 10 || (month === 11 && day < 21)) {
      return 'Primavera';
    }
    if ((month === 11 && day >= 21) || month === 0 || month === 1 || (month === 2 && day < 20)) {
      return 'Verão';
    }
    if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) {
      return 'Outono';
    }
    return 'Inverno';
  } else {
    // Northern hemisphere
    if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) {
      return 'Primavera';
    }
    if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 22)) {
      return 'Verão';
    }
    if ((month === 8 && day >= 22) || month === 9 || month === 10 || (month === 11 && day < 21)) {
      return 'Outono';
    }
    return 'Inverno';
  }
}

export function getSeasonEmojis(season: 'Primavera' | 'Verão' | 'Outono' | 'Inverno', condition?: string): string[] {
  if (condition?.toLowerCase().includes('chuv') || condition?.toLowerCase().includes('rain')) {
    return ['🌧️', '💧', '🫧', '☔', '🌸'];
  }
  if (condition?.toLowerCase().includes('neve') || condition?.toLowerCase().includes('snow')) {
    return ['❄️', '⛄', '🌨️', '✨'];
  }

  switch (season) {
    case 'Primavera':
      return ['🌸', '🌷', '🌺', '🌼', '🦋', '🍃'];
    case 'Verão':
      return ['☀️', '🌻', '🌊', '🍉', '✨', '🌴'];
    case 'Outono':
      return ['🍂', '🍁', '🍄', '🌰', '🌾', '☕'];
    case 'Inverno':
      return ['❄️', '⛄', '🌨️', '☕', '🧣', '✨'];
    default:
      return ['🌸', '✨', '💖', '🍃'];
  }
}

export const DEFAULT_WEATHER_STATE: WeatherSeasonState = {
  city: 'Guarulhos',
  temp: 19,
  condition: 'Ameno',
  season: 'Primavera',
  emojis: ['🌸', '🌷', '🌺', '🌼', '🦋', '🍃'],
  activeAnimation: true,
  particlesDensity: 'normal',
};

export const PRESET_CITIES = [
  { city: 'Guarulhos', temp: 19, condition: 'Ameno', season: 'Primavera' as const },
  { city: 'São Paulo', temp: 22, condition: 'Ensolarado', season: 'Primavera' as const },
  { city: 'Rio de Janeiro', temp: 28, condition: 'Verão Quente', season: 'Verão' as const },
  { city: 'Curitiba', temp: 14, condition: 'Frio / Nebuloso', season: 'Inverno' as const },
  { city: 'Belo Horizonte', temp: 24, condition: 'Céu Aberto', season: 'Primavera' as const },
  { city: 'Salvador', temp: 29, condition: 'Ensolarado', season: 'Verão' as const },
  { city: 'Porto Alegre', temp: 17, condition: 'Chuvoso', season: 'Outono' as const },
  { city: 'Lisboa', temp: 20, condition: 'Brisa Marítima', season: 'Outono' as const },
  { city: 'Tokyo', temp: 18, condition: 'Brisa de Outono', season: 'Outono' as const },
  { city: 'Paris', temp: 12, condition: 'Chuva Suave', season: 'Outono' as const },
];
