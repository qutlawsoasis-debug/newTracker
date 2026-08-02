import React, { useEffect, useState } from "react";

export default function CalorieCounter({ 
  eatenCalories, targetCalories = 3000, 
  totalCalories = 0, lostCalories = 0, 
  eatenProteins = 0, targetProteins = 0,
  eatenFats = 0, targetFats = 0,
  eatenCarbs = 0, targetCarbs = 0,
  streak = 0,
  translations 
}) {
  const [displayCalories, setDisplayCalories] = useState(0);
  const [displayProteins, setDisplayProteins] = useState(0);
  const [displayFats, setDisplayFats] = useState(0);
  const [displayCarbs, setDisplayCarbs] = useState(0);

  useEffect(() => {
    setDisplayProteins(eatenProteins);
    setDisplayFats(eatenFats);
    setDisplayCarbs(eatenCarbs);
  }, [eatenProteins, eatenFats, eatenCarbs]);

  useEffect(() => {
    let start = displayCalories;
    const end = eatenCalories;
    const diff = end - start;
    if (diff === 0) return;
    
    // Smooth counting transition up or down
    const duration = 400;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = diff / steps;
    let stepCount = 0;
    
    const timer = setInterval(() => {
      stepCount++;
      start += increment;
      if (stepCount >= steps) {
        setDisplayCalories(end);
        clearInterval(timer);
      } else {
        setDisplayCalories(Math.round(start));
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [eatenCalories]);

  const diff = targetCalories - eatenCalories;
  const isDeficit = diff > 0;
  const absDiff = Math.abs(diff);
  const showLost = lostCalories > 0;

  return (
    <div className="bg-zinc-50 rounded-xl border border-zinc-200/60 p-5 mb-6 shadow-sm">
      {/* Label */}
      <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-3">
        {translations.dayProgress}
      </p>

      {/* Main Big Calorie Display (Actually eaten calories) */}
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-[40px] font-bold tracking-tight text-[#1D1D1F] leading-none">
          {displayCalories.toLocaleString()}
        </span>
        <span className="text-sm font-medium text-zinc-400 ml-0.5">kcal</span>
      </div>

      {/* Calorie Info Bar: Ziel: [Target] kcal | Geplantes Menü: [Total] kcal */}
      <p className="text-[13px] font-medium text-zinc-500 mb-4">
        {translations.targetCal
          ? translations.targetCal.replace("{target}", targetCalories.toLocaleString()).replace("{total}", totalCalories.toLocaleString())
          : `Ziel: ${targetCalories} kcal | Geplantes Menü: ${totalCalories} kcal`
        }
      </p>

      {/* Macros Section */}
      {(targetProteins > 0) && (
        <div className="flex flex-col gap-2 mb-4 pt-4 border-t border-zinc-200/60">
          {/* Protein */}
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-zinc-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500/80"></span> {translations.dayProgress === "Прогресс за день" ? "Белки" : "Protein"}</span>
            <span className="text-zinc-800">{displayProteins} / {targetProteins}g</span>
          </div>
          <div className="w-full bg-zinc-200 rounded-full h-1.5 mb-2">
            <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (displayProteins / targetProteins) * 100)}%` }}></div>
          </div>
          
          {/* Fats */}
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-zinc-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500/80"></span> {translations.dayProgress === "Прогресс за день" ? "Жиры" : "Fats"}</span>
            <span className="text-zinc-800">{displayFats} / {targetFats}g</span>
          </div>
          <div className="w-full bg-zinc-200 rounded-full h-1.5 mb-2">
            <div className="bg-yellow-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (displayFats / targetFats) * 100)}%` }}></div>
          </div>

          {/* Carbs */}
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-zinc-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500/80"></span> {translations.dayProgress === "Прогресс за день" ? "Углеводы" : "Carbs"}</span>
            <span className="text-zinc-800">{displayCarbs} / {targetCarbs}g</span>
          </div>
          <div className="w-full bg-zinc-200 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (displayCarbs / targetCarbs) * 100)}%` }}></div>
          </div>
        </div>
      )}

      {/* Deficit / Surplus Indicator */}
      <div className="pt-3 border-t border-zinc-200/60">
        {showLost ? (
          <div className="border-l-2 border-zinc-300 pl-3 py-0.5 bg-zinc-500/[0.02]">
            <span className="text-[12px] font-medium text-zinc-400 block">
              {translations.dayProgress === "Прогресс за день"
                ? `Пропущено: ${lostCalories} ккал`
                : `Verpasst: ${lostCalories} kcal`
              }
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${isDeficit ? 'bg-zinc-800' : 'bg-zinc-400'}`} />
            <span className="text-[13px] font-bold text-zinc-700">
              {isDeficit 
                ? (translations.deficit ? translations.deficit.replace("{diff}", absDiff.toLocaleString()) : `Defizit: ${absDiff} kcal`)
                : (translations.surplus ? translations.surplus.replace("{diff}", absDiff.toLocaleString()) : `Überschuss: ${absDiff} kcal`)
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
