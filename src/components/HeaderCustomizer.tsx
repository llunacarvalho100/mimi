import React, { useState } from 'react';
import {
  Palette,
  Type,
  LayoutGrid,
  Sparkles,
  MapPin,
  Check,
  Grid3X3,
  List,
} from 'lucide-react';
import { FontChoice, LayoutMode, UserProfile, WeatherSeasonState } from '../types';

interface HeaderCustomizerProps {
  profile: UserProfile;
  weather: WeatherSeasonState;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onOpenWeatherModal: () => void;
  onToggleParticles: () => void;
}

const COLOR_PRESETS = [
  { name: 'Rosa Romance', color: '#ffeef4' },
  { name: 'Lavanda Suave', color: '#f5f3ff' },
  { name: 'Pêssego Aconchego', color: '#fff1f2' },
  { name: 'Menta Fresca', color: '#f0fdf4' },
  { name: 'Céu Pastel', color: '#f0f9ff' },
  { name: 'Amêndoa Quente', color: '#fefce8' },
  { name: 'Branco Minimal', color: '#ffffff' },
  { name: 'Dark Velvet', color: '#0f172a' },
  { name: 'Dark Rosé', color: '#271b24' },
];

const FONTS: { id: FontChoice; label: string }[] = [
  { id: 'font-twitter', label: 'Twitter / Chirp (Padrão Oficial)' },
  { id: 'font-jakarta', label: 'Jakarta (Minimalista)' },
  { id: 'font-poppins', label: 'Poppins (Moderna)' },
  { id: 'font-caveat', label: 'Caveat (Manuscrita)' },
  { id: 'font-playfair', label: 'Playfair (Editorial)' },
  { id: 'font-outfit', label: 'Outfit (Geométrica)' },
];

export const HeaderCustomizer: React.FC<HeaderCustomizerProps> = ({
  profile,
  weather,
  onUpdateProfile,
  onOpenWeatherModal,
  onToggleParticles,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customHex, setCustomHex] = useState(profile.bgColor);

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateProfile({ fontFamily: e.target.value as FontChoice });
  };

  const handleLayoutChange = (mode: LayoutMode) => {
    onUpdateProfile({ layoutMode: mode });
  };

  const handleApplyColor = (color: string) => {
    setCustomHex(color);
    onUpdateProfile({ bgColor: color });
  };

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4 pt-3 pb-1">
      {/* Weather & Season Pill as seen in screenshots */}
      <div className="flex justify-center mb-2.5">
        <button
          onClick={onOpenWeatherModal}
          className="group inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer shadow-2xs"
          title="Clique para alterar localização ou clima"
        >
          <span className="text-sm group-hover:scale-115 transition-transform">
            {weather.emojis[0] || '🌸'}
          </span>
          <span className="tabular-nums font-semibold">{weather.temp}ºC</span>
          <span className="text-slate-400">em</span>
          <span className="font-medium underline decoration-dotted underline-offset-2">
            {weather.city}
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-slate-500 dark:text-slate-400">
            {weather.season} / {weather.condition}
          </span>
          <MapPin className="w-3 h-3 text-rose-400 ml-0.5" />
        </button>
      </div>

      {/* Minimalist Customization Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 shadow-2xs text-xs">
        {/* Left Side: Background Color & Font Picker */}
        <div className="flex items-center gap-3">
          {/* Cor de Fundo */}
          <div className="relative flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Palette className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-medium text-[11px]">Cor de Fundo:</span>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-700 shadow-2xs transition-transform hover:scale-105"
              style={{ backgroundColor: profile.bgColor }}
              title="Personalizar cor de fundo da página"
            />

            {/* Popover */}
            {showColorPicker && (
              <div className="absolute top-8 left-0 z-50 p-3 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Paletas Suaves
                  </span>
                  <button
                    onClick={() => setShowColorPicker(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => handleApplyColor(p.color)}
                      className="group flex flex-col items-center gap-1 p-1 rounded-md border border-slate-200 dark:border-slate-800 hover:border-rose-400 transition-all text-[9px]"
                    >
                      <div
                        className="w-full h-5 rounded border border-black/10 flex items-center justify-center"
                        style={{ backgroundColor: p.color }}
                      >
                        {profile.bgColor === p.color && (
                          <Check className="w-3 h-3 text-slate-900" />
                        )}
                      </div>
                      <span className="truncate w-full text-center">{p.name}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={customHex}
                      onChange={(e) => handleApplyColor(e.target.value)}
                      className="w-6 h-6 rounded border-none cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={customHex}
                      onChange={(e) => handleApplyColor(e.target.value)}
                      className="flex-1 px-2 py-1 text-[11px] border rounded bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      placeholder="#ffeef4"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Fonte */}
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Type className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-medium text-[11px]">Fonte:</span>
            <select
              value={profile.fontFamily}
              onChange={handleFontChange}
              className="py-0.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-[11px] font-medium text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-indigo-400 outline-none cursor-pointer"
            >
              {FONTS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side: Layout Style & Background Emojis Toggle */}
        <div className="flex items-center gap-2">
          {/* Layout Segmented Control (Generic Minimalist Names) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
            <button
              onClick={() => handleLayoutChange('mosaic')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                profile.layoutMode === 'mosaic'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Exibição em Mosaico Visual de Cartões"
            >
              <Grid3X3 className="w-3 h-3" />
              <span>Mosaico</span>
            </button>
            <button
              onClick={() => handleLayoutChange('timeline')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                profile.layoutMode === 'timeline'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Exibição em Linha do Tempo Cronológica"
            >
              <List className="w-3 h-3" />
              <span>Linha do Tempo</span>
            </button>
            <button
              onClick={() => handleLayoutChange('bento')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                profile.layoutMode === 'bento'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Exibição em Blocos Bento"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Blocos</span>
            </button>
          </div>

          {/* Toggle Emojis */}
          <button
            onClick={onToggleParticles}
            className={`p-1 px-2 rounded-lg border text-[11px] flex items-center gap-1 transition-all ${
              weather.activeAnimation
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
            }`}
            title="Ativar ou desativar emojis no fundo"
          >
            <Sparkles className="w-3 h-3" />
            <span>Emojis</span>
          </button>
        </div>
      </div>
    </div>
  );
};
