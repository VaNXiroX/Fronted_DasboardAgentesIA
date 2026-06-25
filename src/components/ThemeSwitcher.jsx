import React, { useState, useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeSwitcher({ compact = false }) {
  const { themeId, setThemeId, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative" data-testid="theme-switcher">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Cambiar tema"
        className="h-9 w-9 grid place-items-center rounded-md border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors theme-btn"
        data-testid="theme-switcher-btn"
        aria-label="Cambiar tema de color"
      >
        <Palette className="h-4 w-4" strokeWidth={1.6} />
      </button>

      {open && (
        <div
          className="theme-dropdown absolute right-0 mt-2 w-52 rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl z-50 p-2 space-y-1 animate-fadeIn"
          data-testid="theme-dropdown"
        >
          <p className="px-2 pt-1 pb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
            Tema de color
          </p>
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => { setThemeId(theme.id); setOpen(false); }}
              data-testid={`theme-option-${theme.id}`}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                themeId === theme.id
                  ? "bg-zinc-800/80 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
            >
              {/* Color swatches */}
              <div className="flex gap-0.5 shrink-0">
                {theme.preview.map((color, i) => (
                  <span
                    key={i}
                    className="h-4 w-4 rounded-full border border-white/10"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="flex-1 text-left font-medium">{theme.label}</span>
              {themeId === theme.id && (
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
