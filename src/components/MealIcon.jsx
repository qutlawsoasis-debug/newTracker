import React from "react";

const icons = {
  /* ── BREAKFAST ─────────────────────────────────────── */

  oats_bowl: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M12 30 Q12 48 32 48 Q52 48 52 30 Z" fill="#F5EFE6" />
      <path d="M8 30 H56" stroke="#C49A5F" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="36" r="3" fill="#D4B07A" />
      <circle cx="34" cy="34" r="3" fill="#D4B07A" />
      <circle cx="28" cy="28" r="2.5" fill="#C46080" />
      <circle cx="38" cy="30" r="2" fill="#C46080" />
    </svg>
  ),

  choco_shake: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M22 16 L20 52 H44 L42 16 Z" fill="#6B4E35" />
      <rect x="20" y="12" width="24" height="6" rx="2" fill="#F5EFE6" />
      <ellipse cx="32" cy="14" rx="10" ry="3" fill="#EEE8DC" />
      <rect x="28" y="6" width="3" height="10" rx="1" fill="#C49A5F" />
      <circle cx="30" cy="6" r="3" fill="#F5EFE6" />
    </svg>
  ),

  berry_quark: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M12 30 Q12 48 32 48 Q52 48 52 30 Z" fill="#EEE8DC" />
      <path d="M8 30 H56" stroke="#C49A5F" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="34" r="3.5" fill="#C46080" />
      <circle cx="32" cy="32" r="3" fill="#C46080" />
      <circle cx="38" cy="36" r="3" fill="#C46080" />
      <ellipse cx="32" cy="38" rx="8" ry="3" fill="#F5EFE6" opacity="0.6" />
    </svg>
  ),

  cheese_omelette: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="38" rx="22" ry="12" fill="#EEE8DC" />
      <path d="M14 36 Q32 20 50 36" fill="#E8C44A" />
      <path d="M14 36 Q32 24 50 36" fill="#F0D060" opacity="0.5" />
      <ellipse cx="28" cy="34" rx="4" ry="2" fill="#E8C44A" />
      <ellipse cx="38" cy="33" rx="3" ry="1.5" fill="#E8C44A" />
    </svg>
  ),

  avocado_egg: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="26" cy="34" rx="14" ry="18" fill="#7CAE7F" />
      <ellipse cx="26" cy="36" rx="8" ry="10" fill="#D4B07A" />
      <circle cx="26" cy="38" r="5" fill="#F5EFE6" />
      <circle cx="26" cy="38" r="3" fill="#E8C44A" />
      <ellipse cx="44" cy="34" rx="10" ry="14" fill="#7CAE7F" />
    </svg>
  ),

  pancake_nutella: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="44" rx="18" ry="6" fill="#C49A5F" />
      <ellipse cx="32" cy="38" rx="18" ry="6" fill="#D4B07A" />
      <ellipse cx="32" cy="32" rx="18" ry="6" fill="#C49A5F" />
      <ellipse cx="32" cy="26" rx="18" ry="6" fill="#D4B07A" />
      <ellipse cx="32" cy="26" rx="12" ry="4" fill="#6B4E35" />
    </svg>
  ),

  mascarpone_muesli: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M12 28 Q12 48 32 48 Q52 48 52 28 Z" fill="#F5EFE6" />
      <path d="M8 28 H56" stroke="#C49A5F" strokeWidth="3" strokeLinecap="round" />
      <circle cx="22" cy="34" r="2.5" fill="#C49A5F" />
      <circle cx="30" cy="32" r="2" fill="#D4B07A" />
      <circle cx="38" cy="35" r="2.5" fill="#C49A5F" />
      <circle cx="34" cy="30" r="2" fill="#D4B07A" />
    </svg>
  ),

  snickers_oats: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M12 30 Q12 48 32 48 Q52 48 52 30 Z" fill="#F5EFE6" />
      <path d="M8 30 H56" stroke="#C49A5F" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="32" cy="36" rx="14" ry="6" fill="#D4B07A" />
      <circle cx="25" cy="34" r="2.5" fill="#8B6844" />
      <circle cx="33" cy="32" r="2" fill="#8B6844" />
      <circle cx="39" cy="35" r="2.5" fill="#6B4E35" />
    </svg>
  ),

  scrambled_ham: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="40" rx="24" ry="12" fill="#EEE8DC" />
      <ellipse cx="26" cy="36" rx="8" ry="5" fill="#E8C44A" />
      <ellipse cx="22" cy="34" rx="5" ry="3" fill="#F0D060" />
      <rect x="36" y="32" width="14" height="8" rx="2" fill="#A0785A" />
      <rect x="38" y="34" width="10" height="4" rx="1" fill="#C46080" opacity="0.5" />
    </svg>
  ),

  rice_pudding: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M12 28 Q12 48 32 48 Q52 48 52 28 Z" fill="#F5EFE6" />
      <path d="M8 28 H56" stroke="#C49A5F" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="32" cy="34" rx="14" ry="6" fill="#EEE8DC" />
      <circle cx="32" cy="30" r="5" fill="#D46050" />
      <circle cx="32" cy="30" r="3" fill="#C46080" />
    </svg>
  ),

  cereal_bowl: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M12 30 Q12 48 32 48 Q52 48 52 30 Z" fill="#EEE8DC" />
      <path d="M8 30 H56" stroke="#C49A5F" strokeWidth="3" strokeLinecap="round" />
      <circle cx="22" cy="34" r="3" fill="#D4B07A" />
      <circle cx="30" cy="32" r="2.5" fill="#C49A5F" />
      <circle cx="38" cy="34" r="3" fill="#D4B07A" />
      <circle cx="34" cy="28" r="2" fill="#F5EFE6" />
    </svg>
  ),

  baked_banana: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="42" rx="24" ry="10" fill="#EEE8DC" />
      <path d="M14 36 Q20 28 32 30 Q44 28 50 36" stroke="#C49A5F" strokeWidth="4" fill="#F0D060" strokeLinecap="round" />
      <path d="M14 40 Q20 32 32 34 Q44 32 50 40" stroke="#C49A5F" strokeWidth="4" fill="#F0D060" strokeLinecap="round" />
      <ellipse cx="32" cy="36" rx="8" ry="2" fill="#6B4E35" opacity="0.3" />
    </svg>
  ),

  bacon_tower: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="14" y="40" width="36" height="8" rx="2" fill="#D4B07A" />
      <rect x="16" y="34" width="32" height="6" rx="1" fill="#A0785A" />
      <rect x="14" y="28" width="36" height="8" rx="2" fill="#D4B07A" />
      <rect x="16" y="22" width="32" height="6" rx="1" fill="#A0785A" />
      <rect x="14" y="16" width="36" height="8" rx="2" fill="#D4B07A" />
    </svg>
  ),

  cherry_shake: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M22 16 L20 52 H44 L42 16 Z" fill="#C46080" />
      <rect x="20" y="12" width="24" height="6" rx="2" fill="#F5EFE6" />
      <ellipse cx="32" cy="14" rx="10" ry="3" fill="#EEE8DC" />
      <rect x="28" y="6" width="3" height="10" rx="1" fill="#C49A5F" />
      <circle cx="30" cy="6" r="3" fill="#F5EFE6" />
    </svg>
  ),

  cheese_waffle: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="12" y="18" width="40" height="28" rx="4" fill="#D4B07A" />
      <line x1="22" y1="18" x2="22" y2="46" stroke="#C49A5F" strokeWidth="1.5" />
      <line x1="32" y1="18" x2="32" y2="46" stroke="#C49A5F" strokeWidth="1.5" />
      <line x1="42" y1="18" x2="42" y2="46" stroke="#C49A5F" strokeWidth="1.5" />
      <line x1="12" y1="28" x2="52" y2="28" stroke="#C49A5F" strokeWidth="1.5" />
      <line x1="12" y1="38" x2="52" y2="38" stroke="#C49A5F" strokeWidth="1.5" />
    </svg>
  ),

  /* ── LUNCH ─────────────────────────────────────────── */

  salmon_plate: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="40" rx="26" ry="12" fill="#EEE8DC" />
      <path d="M16 34 Q24 24 44 28 Q50 30 48 36 Q44 40 16 34 Z" fill="#A0785A" />
      <path d="M18 33 Q26 26 42 29" stroke="#C49A5F" strokeWidth="1" />
      <path d="M18 35 Q26 28 42 31" stroke="#C49A5F" strokeWidth="1" />
      <circle cx="44" cy="36" r="3" fill="#7CAE7F" />
    </svg>
  ),

  tuna_pasta: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M10 30 Q10 50 32 50 Q54 50 54 30 Z" fill="#F5EFE6" />
      <path d="M6 30 H58" stroke="#C49A5F" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 36 Q24 30 30 38 Q36 30 42 36" stroke="#D4B07A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="36" cy="34" rx="6" ry="4" fill="#A0785A" />
      <ellipse cx="36" cy="33" rx="4" ry="2.5" fill="#8B6844" />
    </svg>
  ),

  teriyaki_chicken: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M10 30 Q10 50 32 50 Q54 50 54 30 Z" fill="#F5EFE6" />
      <path d="M6 30 H58" stroke="#C49A5F" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="26" cy="38" rx="10" ry="6" fill="#EEE8DC" />
      <rect x="36" y="32" width="8" height="6" rx="2" fill="#8B6844" />
      <rect x="38" y="36" width="6" height="5" rx="2" fill="#A0785A" />
      <rect x="34" y="38" width="7" height="5" rx="2" fill="#8B6844" />
    </svg>
  ),

  tuna_wrap: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M18 14 L46 14 L38 52 L10 52 Z" fill="#D4B07A" />
      <path d="M20 16 L44 16 L37 48 L13 48 Z" fill="#F5EFE6" />
      <ellipse cx="28" cy="30" rx="6" ry="4" fill="#A0785A" />
      <circle cx="24" cy="36" r="3" fill="#7CAE7F" />
      <circle cx="32" cy="38" r="2.5" fill="#D46050" />
    </svg>
  ),

  carbonara: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M10 30 Q10 50 32 50 Q54 50 54 30 Z" fill="#F5EFE6" />
      <path d="M6 30 H58" stroke="#C49A5F" strokeWidth="3" strokeLinecap="round" />
      <path d="M16 36 Q22 28 28 38 Q34 28 40 36 Q46 28 48 36" stroke="#D4B07A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="30" cy="34" r="3" fill="#E8C44A" />
      <circle cx="38" cy="32" r="2" fill="#E8C44A" />
    </svg>
  ),

  bratwurst_plate: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="40" rx="26" ry="12" fill="#EEE8DC" />
      <rect x="12" y="30" width="40" height="8" rx="4" fill="#A0785A" />
      <rect x="12" y="38" width="40" height="8" rx="4" fill="#8B6844" />
      <ellipse cx="32" cy="34" rx="18" ry="1" fill="#C49A5F" opacity="0.4" />
    </svg>
  ),

  burger_pasta: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M10 30 Q10 50 32 50 Q54 50 54 30 Z" fill="#F5EFE6" />
      <path d="M6 30 H58" stroke="#C49A5F" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 38 Q26 30 34 40 Q42 30 48 38" stroke="#D4B07A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="28" cy="34" r="4" fill="#8B6844" />
      <circle cx="36" cy="36" r="3.5" fill="#A0785A" />
    </svg>
  ),

  tortellini_pan: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="30" cy="38" rx="22" ry="14" fill="#EEE8DC" />
      <rect x="48" y="34" width="14" height="4" rx="2" fill="#C49A5F" />
      <path d="M20 34 Q24 28 28 34 Q26 38 20 34 Z" fill="#D4B07A" />
      <path d="M30 32 Q34 26 38 32 Q36 36 30 32 Z" fill="#D4B07A" />
      <path d="M24 40 Q28 34 32 40 Q30 44 24 40 Z" fill="#D4B07A" />
      <path d="M36 38 Q40 32 44 38 Q42 42 36 38 Z" fill="#D4B07A" />
    </svg>
  ),

  cheese_spaetzle: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M10 30 Q10 50 32 50 Q54 50 54 30 Z" fill="#F5EFE6" />
      <path d="M6 30 H58" stroke="#C49A5F" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="28" cy="38" rx="12" ry="6" fill="#D4B07A" />
      <ellipse cx="32" cy="34" rx="10" ry="5" fill="#E8C44A" />
      <circle cx="26" cy="32" r="2" fill="#F0D060" />
      <circle cx="36" cy="34" r="2.5" fill="#F0D060" />
    </svg>
  ),

  chili_bowl: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M10 28 Q10 48 32 48 Q54 48 54 28 Z" fill="#D46050" />
      <path d="M6 28 H58" stroke="#C49A5F" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="36" r="3" fill="#8B6844" />
      <circle cx="34" cy="34" r="2.5" fill="#8B6844" />
      <circle cx="28" cy="40" r="2.5" fill="#8B6844" />
      <circle cx="40" cy="38" r="2" fill="#7CAE7F" />
    </svg>
  ),

  chicken_nuggets: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="42" rx="26" ry="12" fill="#EEE8DC" />
      <ellipse cx="38" cy="38" rx="10" ry="8" fill="#F5EFE6" />
      <rect x="14" y="30" width="10" height="7" rx="3" fill="#D4B07A" />
      <rect x="22" y="28" width="9" height="7" rx="3" fill="#C49A5F" />
      <rect x="18" y="36" width="10" height="6" rx="3" fill="#D4B07A" />
    </svg>
  ),

  wurst_plate: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="40" rx="26" ry="12" fill="#EEE8DC" />
      <rect x="10" y="28" width="44" height="7" rx="3.5" fill="#A0785A" />
      <rect x="10" y="38" width="44" height="7" rx="3.5" fill="#A0785A" />
      <circle cx="12" cy="31.5" r="1.5" fill="#8B6844" />
      <circle cx="12" cy="41.5" r="1.5" fill="#8B6844" />
    </svg>
  ),

  gnocchi_plate: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="40" rx="26" ry="12" fill="#EEE8DC" />
      <ellipse cx="32" cy="36" rx="16" ry="8" fill="#D46050" opacity="0.5" />
      <ellipse cx="22" cy="36" rx="4" ry="3" fill="#D4B07A" />
      <ellipse cx="32" cy="34" rx="4" ry="3" fill="#D4B07A" />
      <ellipse cx="42" cy="36" rx="4" ry="3" fill="#D4B07A" />
      <ellipse cx="27" cy="40" rx="4" ry="3" fill="#D4B07A" />
    </svg>
  ),

  meatball_pasta: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M10 30 Q10 50 32 50 Q54 50 54 30 Z" fill="#F5EFE6" />
      <path d="M6 30 H58" stroke="#C49A5F" strokeWidth="3" strokeLinecap="round" />
      <path d="M16 38 Q24 30 32 40 Q40 30 48 38" stroke="#D4B07A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="24" cy="34" r="4.5" fill="#8B6844" />
      <circle cx="36" cy="32" r="4.5" fill="#A0785A" />
      <circle cx="42" cy="38" r="4" fill="#8B6844" />
    </svg>
  ),

  maultaschen: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="40" rx="26" ry="12" fill="#EEE8DC" />
      <rect x="14" y="26" width="16" height="14" rx="3" fill="#D4B07A" />
      <rect x="34" y="26" width="16" height="14" rx="3" fill="#D4B07A" />
      <line x1="22" y1="26" x2="22" y2="40" stroke="#C49A5F" strokeWidth="1.5" strokeDasharray="2 2" />
      <line x1="42" y1="26" x2="42" y2="40" stroke="#C49A5F" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  ),

  /* ── NIGHT ─────────────────────────────────────────── */

  overnight_oats: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="18" y="12" width="28" height="40" rx="4" fill="#F5EFE6" />
      <rect x="18" y="36" width="28" height="16" rx="0" fill="#D4B07A" />
      <rect x="18" y="28" width="28" height="10" fill="#EEE8DC" />
      <rect x="18" y="20" width="28" height="10" fill="#C46080" opacity="0.5" />
      <rect x="16" y="10" width="32" height="5" rx="2" fill="#C49A5F" />
    </svg>
  ),

  croissant: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M10 40 Q16 18 32 22 Q48 18 54 40 Q48 44 32 36 Q16 44 10 40 Z" fill="#D4B07A" />
      <path d="M16 38 Q20 24 32 26 Q44 24 48 38" fill="#C49A5F" />
      <path d="M22 36 Q26 28 32 28 Q38 28 42 36" fill="#D4B07A" opacity="0.7" />
    </svg>
  ),

  nut_toast: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="10" y="16" width="20" height="32" rx="3" fill="#D4B07A" />
      <rect x="34" y="16" width="20" height="32" rx="3" fill="#D4B07A" />
      <rect x="13" y="20" width="14" height="24" rx="1" fill="#8B6844" />
      <rect x="37" y="20" width="14" height="24" rx="1" fill="#8B6844" />
      <circle cx="20" cy="30" r="2" fill="#C49A5F" />
      <circle cx="44" cy="32" r="2" fill="#C49A5F" />
    </svg>
  ),

  cold_meat: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="36" rx="20" ry="14" fill="#D4B07A" />
      <path d="M14 34 Q32 26 50 34" fill="#C49A5F" />
      <ellipse cx="32" cy="34" rx="12" ry="4" fill="#A0785A" />
      <ellipse cx="32" cy="33" rx="8" ry="2.5" fill="#C46080" opacity="0.5" />
      <circle cx="38" cy="32" r="2" fill="#7CAE7F" />
    </svg>
  ),

  choco_bun: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="38" rx="18" ry="14" fill="#6B4E35" />
      <path d="M16 34 Q32 16 48 34" fill="#8B6844" />
      <ellipse cx="32" cy="36" rx="12" ry="4" fill="#6B4E35" opacity="0.6" />
      <path d="M26 28 Q32 20 38 28" stroke="#C49A5F" strokeWidth="1.5" fill="none" />
    </svg>
  ),

  tuna_sandwich: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M10 44 L32 16 L54 44 Z" fill="#D4B07A" />
      <path d="M14 42 L32 20 L50 42 Z" fill="#F5EFE6" />
      <ellipse cx="32" cy="36" rx="10" ry="4" fill="#A0785A" />
      <line x1="16" y1="44" x2="48" y2="44" stroke="#7CAE7F" strokeWidth="2" />
      <line x1="10" y1="44" x2="54" y2="44" stroke="#D4B07A" strokeWidth="3" />
    </svg>
  ),

  waffle_sandwich: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="12" y="16" width="40" height="12" rx="3" fill="#D4B07A" />
      <line x1="22" y1="16" x2="22" y2="28" stroke="#C49A5F" strokeWidth="1.5" />
      <line x1="32" y1="16" x2="32" y2="28" stroke="#C49A5F" strokeWidth="1.5" />
      <line x1="42" y1="16" x2="42" y2="28" stroke="#C49A5F" strokeWidth="1.5" />
      <rect x="14" y="28" width="36" height="8" rx="1" fill="#F5EFE6" />
      <rect x="12" y="36" width="40" height="12" rx="3" fill="#D4B07A" />
    </svg>
  ),

  salmon_bagel: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="38" rx="20" ry="14" fill="#D4B07A" />
      <ellipse cx="32" cy="38" rx="8" ry="6" fill="#F5EFE6" />
      <path d="M14 36 Q32 28 50 36" fill="#C49A5F" />
      <ellipse cx="32" cy="34" rx="14" ry="4" fill="#A0785A" />
      <ellipse cx="32" cy="33" rx="10" ry="2" fill="#C46080" opacity="0.4" />
    </svg>
  ),

  banana_quark: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="20" y="16" width="24" height="34" rx="4" fill="#F5EFE6" />
      <ellipse cx="32" cy="36" rx="10" ry="8" fill="#EEE8DC" />
      <path d="M24 30 Q28 22 36 26" stroke="#F0D060" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="25" cy="28" r="2" fill="#C49A5F" />
    </svg>
  ),

  snack_plate: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="40" rx="26" ry="12" fill="#EEE8DC" />
      <rect x="16" y="30" width="7" height="7" rx="1" fill="#E8C44A" />
      <rect x="26" y="28" width="7" height="7" rx="1" fill="#E8C44A" />
      <rect x="36" y="32" width="5" height="14" rx="2" fill="#C49A5F" />
      <rect x="44" y="30" width="5" height="14" rx="2" fill="#A0785A" />
    </svg>
  ),

  trail_mix: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <circle cx="20" cy="30" r="4" fill="#C49A5F" />
      <circle cx="34" cy="26" r="3" fill="#8B6844" />
      <circle cx="44" cy="32" r="3.5" fill="#D4B07A" />
      <circle cx="26" cy="40" r="3.5" fill="#6B4E35" />
      <circle cx="40" cy="42" r="3" fill="#C49A5F" />
      <circle cx="16" cy="42" r="2.5" fill="#C46080" />
    </svg>
  ),

  cold_wrap: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect x="14" y="20" width="36" height="24" rx="12" fill="#D4B07A" />
      <rect x="18" y="24" width="28" height="16" rx="8" fill="#F5EFE6" />
      <circle cx="28" cy="32" r="3" fill="#7CAE7F" />
      <circle cx="36" cy="32" r="3" fill="#A0785A" />
      <circle cx="32" cy="28" r="2" fill="#D46050" />
    </svg>
  ),

  donut: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <circle cx="32" cy="32" r="18" fill="#D4B07A" />
      <circle cx="32" cy="32" r="7" fill="#F5EFE6" />
      <path d="M14 30 Q18 18 32 16 Q46 18 50 30" fill="#C46080" />
      <circle cx="24" cy="24" r="1.5" fill="#F0D060" />
      <circle cx="32" cy="20" r="1.5" fill="#E8C44A" />
      <circle cx="40" cy="24" r="1.5" fill="#F0D060" />
    </svg>
  ),

  flatbread: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="34" rx="22" ry="18" fill="#D4B07A" />
      <path d="M16 30 Q32 20 48 30 L44 42 Q32 36 20 42 Z" fill="#F5EFE6" />
      <circle cx="28" cy="34" r="3" fill="#7CAE7F" />
      <circle cx="36" cy="32" r="2.5" fill="#D46050" />
      <ellipse cx="32" cy="38" rx="4" ry="2" fill="#A0785A" />
    </svg>
  ),

  muffin: (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M16 32 L20 52 H44 L48 32 Z" fill="#C49A5F" />
      <path d="M12 32 Q16 16 32 14 Q48 16 52 32 Z" fill="#D4B07A" />
      <path d="M12 32 H52" stroke="#C49A5F" strokeWidth="2" />
      <circle cx="28" cy="24" r="2" fill="#6B4E35" />
      <circle cx="36" cy="22" r="2" fill="#6B4E35" />
    </svg>
  ),
};

export default function MealIcon({ type, className = "" }) {
  return (
    <div className={className}>
      {icons[type] || icons.oats_bowl}
    </div>
  );
}
