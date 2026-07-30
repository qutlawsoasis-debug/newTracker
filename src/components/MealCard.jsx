import React, { useState } from "react";
import MealIcon from "./MealIcon";

export default function MealCard({ meal, section, label, time, onReroll, isEaten, onToggleEaten, lang, translations, onReplaceReady, isMissed }) {
  const [checkedItems, setCheckedItems] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRerolling, setIsRerolling] = useState(false);
  const [isReplacingReady, setIsReplacingReady] = useState(false);

  const handleReplaceReady = async () => {
    if (!onReplaceReady) return;
    setIsReplacingReady(true);
    setCheckedItems({});
    try {
      await onReplaceReady(section);
    } catch (e) {
      console.error(e);
    } finally {
      setIsReplacingReady(false);
    }
  };

  const productsList = lang === "ru" ? (meal.products_ru || []) : (meal.products_de || []);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalProducts = productsList.length;

  const toggleItem = (index) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleReroll = () => {
    setIsRerolling(true);
    setCheckedItems({});
    setTimeout(() => {
      onReroll(section);
      setIsRerolling(false);
    }, 400);
  };

  const recipeRaw = lang === "ru" ? meal.recipe_ru : meal.recipe_de;
  const recipeText = recipeRaw
    ? recipeRaw.replace(/^\[ПОЛНАЯ ТИШИН[АA]\]\s*/i, "").trim()
    : "";

  const titleText = lang === "ru" ? meal.title_ru : meal.title_de;
  const showAsMissed = isMissed && !isEaten;

  return (
    <div className="relative pl-9">
      {/* Timeline dot */}
      <div className={`absolute left-[11px] top-5 w-[9px] h-[9px] rounded-full bg-white border-2 z-10 ${
        showAsMissed ? "border-red-400" : "border-zinc-300"
      }`} />

      {/* Card */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`bg-white border rounded-xl shadow-sm overflow-hidden cursor-pointer select-none transition-all duration-200 ${
          showAsMissed ? "opacity-50 border-red-200 bg-red-50/10" : "opacity-100 border-zinc-200/80"
        }`}
      >

        {/* ── Header: Time — Label + Silent + Kcal + Checkbox ── */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-[#1D1D1F]">{time}</span>
            <span className="text-[13px] text-zinc-300">—</span>
            <span className="text-[13px] font-medium text-zinc-500">{label}</span>
            {meal.is_silent && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200/80">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{translations.silent}</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {showAsMissed ? (
              <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md whitespace-nowrap">
                {lang === "ru" 
                  ? `Пропущено (Утрачено ${meal.calories} ккал)` 
                  : `Verpasst (Verloren ${meal.calories} kcal)`
                }
              </span>
            ) : (
              <span className="text-xs font-medium text-zinc-400 bg-zinc-50 border border-zinc-200/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                {meal.calories} kcal
              </span>
            )}
            {/* Apple style round checkbox button */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleEaten(); }}
              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-200 active:scale-90 flex-shrink-0
                ${isEaten 
                  ? "bg-[#1D1D1F] border-[#1D1D1F] text-white shadow-sm" 
                  : "border-zinc-300 hover:border-zinc-400 bg-zinc-50 text-transparent"}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="border-b border-zinc-100 mx-4" />

        {/* ── Body: Icon + Name ── */}
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-zinc-100 p-1.5 flex-shrink-0">
            <MealIcon type={meal.icon} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-[15px] font-semibold leading-snug transition-all ${
              showAsMissed ? "line-through text-zinc-400" : "text-[#1D1D1F]"
            }`}>
              {titleText}
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
              <span>{totalProducts} {translations.zutatenLabel}</span>
              {checkedCount > 0 && (
                <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100 px-1 py-0.25 rounded">
                  {checkedCount}/{totalProducts}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* ── Expanded Content (Instant display) ── */}
        {isExpanded && (
          <div className="px-4 pb-4">
            <div className="border-t border-zinc-100 mb-4" />

            {/* Shopping List */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  {translations.shoppingList}
                </h4>
                <span className="text-[10px] font-medium text-zinc-400">
                  {checkedCount}/{totalProducts}
                </span>
              </div>

              <div className="h-[3px] rounded-full bg-zinc-100 mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(checkedCount / totalProducts) * 100}%`,
                    background: '#27272a',
                  }}
                />
              </div>

              <div className="space-y-px">
                {productsList.map((product, idx) => (
                  <label
                    key={idx}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 active:scale-[0.99]
                      ${checkedItems[idx] ? "bg-zinc-50" : "hover:bg-zinc-50/60"}`}
                  >
                    <input
                      type="checkbox"
                      className="checkbox-custom"
                      checked={!!checkedItems[idx]}
                      onChange={() => toggleItem(idx)}
                    />
                    <span className={`flex-1 text-[13px] transition-colors duration-150 ${
                      checkedItems[idx] ? "line-through text-zinc-300" : "text-zinc-700"
                    }`}>
                      {product}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Recipe */}
            <div className="mb-5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                {translations.recipe}
              </h4>
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                {recipeText}
              </p>
            </div>

            {/* Action Buttons: Reroll & Ready-to-Eat */}
            {section !== "snack" && (
              <div className="flex gap-2 w-full">
                <button
                  onClick={(e) => { e.stopPropagation(); handleReroll(); }}
                  disabled={isRerolling || isReplacingReady}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                    bg-zinc-50 border border-zinc-200/60
                    hover:bg-zinc-100 active:scale-[0.98]
                    transition-all duration-150
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${isRerolling ? "reroll-spinning" : ""}`}
                >
                  <svg
                    className="reroll-icon w-3.5 h-3.5 text-zinc-500"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="text-[12px] font-medium text-zinc-500">
                    {isRerolling ? translations.rerolling : translations.reroll}
                  </span>
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); handleReplaceReady(); }}
                  disabled={isReplacingReady || isRerolling}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                    bg-zinc-50 border border-zinc-200/60
                    hover:bg-zinc-100 active:scale-[0.98]
                    transition-all duration-150
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="text-[12px] font-medium text-zinc-500">
                    {isReplacingReady 
                      ? (translations.readyToEatReplacing || (lang === "ru" ? "Замена..." : "Ersetze...")) 
                      : (translations.readyToEatBtn || (lang === "ru" ? "Купить готовое" : "Fertiggericht"))}
                  </span>
                </button>
              </div>
            )}

            {/* Collapse button */}
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
              className="w-full mt-4 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 rounded-lg text-xs font-semibold text-zinc-500 transition-all active:scale-[0.98] flex items-center justify-center gap-1"
            >
              {lang === "ru" ? "Свернуть" : "Einklappen"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
