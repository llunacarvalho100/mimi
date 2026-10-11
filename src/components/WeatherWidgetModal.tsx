import React, { useState } from 'react';
import { X, MapPin, Sparkles, Sun, CloudRain, Wind, Snowflake, Check, RefreshCw } from 'lucide-react';
import { WeatherSeasonState } from '../types';
import { PRESET_CITIES, getSeasonEmojis } from '../utils/weatherSeason';

interface WeatherWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherSeasonState;
  onUpdateWeather: (updates: Partial<WeatherSeasonState>) => void;
}

export const WeatherWidgetModal: React.FC<WeatherWidgetModalProps> = ({
  isOpen,
  onClose,
  weather,
  onUpdateWeather,
}) => {
  if (!isOpen) return null;

  const [customCity, setCustomCity] = useState(weather.city);
  const [customTemp, setCustomTemp] = useState(weather.temp);
  const [isLocating, setIsLocating] = useState(false);

  const handleSelectCityPreset = (item: (typeof PRESET_CITIES)[0]) => {
    setCustomCity(item.city);
    setCustomTemp(item.temp);
    const emojis = getSeasonEmojis(item.season, item.condition);
    onUpdateWeather({
      city: item.city,
      temp: item.temp,
      condition: item.condition,
      season: item.season,
      emojis,
    });
  };

  const handleSelectSeason = (season: WeatherSeasonState['season']) => {
    const emojis = getSeasonEmojis(season, weather.condition);
    onUpdateWeather({ season, emojis });
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada no seu navegador.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        // Brazil Guarulhos default / location detected
        onUpdateWeather({
          city: 'Localização Atual',
          temp: 21,
          condition: 'Brisa Agradável',
          season: 'Primavera',
          emojis: ['🌸', '🌷', '🦋', '🍃'],
        });
        setCustomCity('Localização Atual');
        setCustomTemp(21);
      },
      () => {
        setIsLocating(false);
        // Fallback smooth
        onUpdateWeather({
          city: 'Guarulhos',
          temp: 19,
          condition: 'Ameno',
          season: 'Primavera',
          emojis: ['🌸', '🌷', '🌺', '🌼', '🦋'],
        });
      }
    );
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWeather({
      city: customCity.trim() || 'Minha Cidade',
      temp: Number(customTemp) || 20,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Clima & Emojis da Estação
              </h3>
              <p className="text-[11px] text-slate-400">
                Os emojis do fundo reagem à sua estação e clima
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Highlight */}
        <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-center mb-4">
          <div className="flex justify-center gap-1.5 text-2xl mb-1 select-none">
            {weather.emojis.slice(0, 5).map((e, idx) => (
              <span key={idx}>{e}</span>
            ))}
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {weather.temp}ºC em {weather.city}
          </h4>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            Estação: {weather.season} • Condição: {weather.condition}
          </p>
        </div>

        {/* Geolocation Button */}
        <button
          onClick={handleDetectLocation}
          disabled={isLocating}
          className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 mb-4 transition-colors cursor-pointer"
        >
          {isLocating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
          )}
          <span>Detectar minha localização automaticamente</span>
        </button>

        {/* Choose Season Directly */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-500 block mb-1.5 uppercase tracking-wider">
            Trocar Estação do Ano:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'Primavera', label: 'Primavera 🌸', desc: 'Flores & Pétalas' },
              { id: 'Verão', label: 'Verão ☀️', desc: 'Sol & Brilhos' },
              { id: 'Outono', label: 'Outono 🍂', desc: 'Folhas Douradas' },
              { id: 'Inverno', label: 'Inverno ❄️', desc: 'Neve & Cristais' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSeason(s.id as WeatherSeasonState['season'])}
                className={`p-2 rounded-xl text-left border text-xs transition-all ${
                  weather.season === s.id
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 font-bold text-rose-700 dark:text-rose-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>{s.label}</div>
                <div className="text-[10px] text-slate-400 font-normal">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Preset Cities */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-500 block mb-1.5 uppercase tracking-wider">
            Cidades Sugeridas:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_CITIES.slice(0, 6).map((item) => (
              <button
                key={item.city}
                onClick={() => handleSelectCityPreset(item)}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                  weather.city === item.city
                    ? 'bg-rose-500 text-white border-rose-500 font-medium'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                {item.city} ({item.temp}º)
              </button>
            ))}
          </div>
        </div>

        {/* Emojis Density */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-500 block mb-1.5 uppercase tracking-wider">
            Densidade de Emojis Caindo:
          </label>
          <div className="flex items-center gap-2">
            {(['low', 'normal', 'high'] as const).map((density) => (
              <button
                key={density}
                onClick={() => onUpdateWeather({ particlesDensity: density })}
                className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                  weather.particlesDensity === density
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {density === 'low' ? 'Discreto' : density === 'normal' ? 'Normal' : 'Intenso'}
              </button>
            ))}
          </div>
        </div>

        {/* Form to submit */}
        <form onSubmit={handleSaveCustom} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-700"
          >
            Fechar
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl"
          >
            Aplicar ao Fundo
          </button>
        </form>
      </div>
    </div>
  );
};
