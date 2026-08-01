import React, { useState } from "react";

export default function OnboardingScreen({ onComplete, lang = "ru" }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [gender, setGender] = useState("M");
  const [age, setAge] = useState(22);
  const [height, setHeight] = useState(180);
  const [weight, setWeight] = useState(65);
  const [targetWeight, setTargetWeight] = useState(72);
  const [activity, setActivity] = useState("1.375");
  const [goal, setGoal] = useState("gain");

  const isRu = lang === "ru";

  const handleNextStep2 = () => {
    if (!age || age < 10 || age > 120) return;
    if (!height || height < 100 || height > 250) return;
    if (!weight || weight < 20 || weight > 300) return;
    setStep(3);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onComplete({
        gender,
        age: parseInt(age, 10),
        height: parseInt(height, 10),
        weight: parseFloat(weight),
        targetWeight: parseFloat(targetWeight),
        activity: parseFloat(activity),
        goal,
        lang
      });
    } catch (err) {
      console.error("Onboarding submission failed:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white text-zinc-900 flex flex-col justify-between p-6 max-w-lg mx-auto overflow-y-auto font-sans antialiased">
      {/* Top Header & Progress Bar */}
      <div>
        <div className="flex items-center justify-between py-2 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-zinc-950 text-white font-bold flex items-center justify-center text-xs">
              E
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-950">Эппи</span>
          </div>
          <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full">
            {step} / 3
          </span>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden mb-8">
          <div
            className="bg-zinc-950 h-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Loading Overlay */}
        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-zinc-950 border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-lg font-bold text-zinc-900">
              {isRu ? "Создаём твой персональный план..." : "Erstelle deinen persönlichen Plan..."}
            </h3>
            <p className="text-xs text-zinc-500 max-w-xs">
              {isRu
                ? "Рассчитываем калории по Миффлину-Сан Жеору и подбираем блюда..."
                : "Berechne Kalorien nach Mifflin-St Jeor und wähle Produkte aus..."}
            </p>
          </div>
        ) : (
          <>
            {/* STEP 1: Welcome Greeting */}
            {step === 1 && (
              <div className="flex flex-col items-center text-center space-y-6 pt-6 pb-4 animate-fadeIn">
                <div className="w-20 h-20 rounded-3xl bg-zinc-900 text-white flex items-center justify-center shadow-lg shadow-zinc-900/10 mb-2">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight leading-tight mb-2">
                    {isRu ? "Привет! Я помогу тебе набрать вес" : "Hallo! Ich helfe dir zuzunehmen"}
                  </h1>
                  <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                    {isRu ? "Настройка займет всего 1 минуту. Создадим готовый рацион питания." : "Die Einrichtung dauert nur 1 Minute. Wir erstellen deinen Ernährungsplan."}
                  </p>
                </div>

                <div className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 text-left space-y-3 mt-4">
                  <div className="flex items-center space-x-3 text-xs text-zinc-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-[10px]">✓</span>
                    <span>{isRu ? "Персональный подсчет суточной нормы ккал" : "Personalisierte Kalorienberechnung"}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-zinc-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-[10px]">✓</span>
                    <span>{isRu ? "Готовое меню с простыми продуктами" : "Fertige Gerichte aus dem Supermarkt"}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-zinc-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-[10px]">✓</span>
                    <span>{isRu ? "Удобный трекер и ИИ-помощник" : "Einfacher Tracker & KI-Assistent"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Personal Metrics */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight mb-1">
                    {isRu ? "Твои параметры" : "Deine Körperdaten"}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {isRu ? "Нужно для точного расчета уровня метаболизма (BMR)" : "Wichtig für die genaue BMR-Stoffwechselberechnung"}
                  </p>
                </div>

                {/* Gender selector */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                    {isRu ? "Пол" : "Geschlecht"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGender("M")}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                        gender === "M"
                          ? "bg-zinc-950 text-white border-zinc-950 shadow-sm"
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      {isRu ? "Мужчина" : "Männlich"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("F")}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                        gender === "F"
                          ? "bg-zinc-950 text-white border-zinc-950 shadow-sm"
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      {isRu ? "Женщина" : "Weiblich"}
                    </button>
                  </div>
                </div>

                {/* Age, Height, Weight inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      {isRu ? "Возраст (лет)" : "Alter (Jahre)"}
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-all"
                      placeholder="22"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                        {isRu ? "Рост (см)" : "Größe (cm)"}
                      </label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-all"
                        placeholder="180"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                        {isRu ? "Текущий вес (кг)" : "Aktuelles Gewicht (kg)"}
                      </label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-all"
                        placeholder="65"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Goal & Activity */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight mb-1">
                    {isRu ? "Твоя цель" : "Dein Ziel"}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {isRu ? "Выбери желаемый результат и уровень физической активности" : "Wähle dein Wunschergebnis und deine tägliche Aktivität"}
                  </p>
                </div>

                {/* Weight progression badge */}
                <div className="bg-zinc-900 text-white rounded-2xl p-4 flex items-center justify-around text-center shadow-md">
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                      {isRu ? "Сейчас" : "Jetzt"}
                    </span>
                    <span className="text-xl font-black">{weight} <span className="text-xs font-medium text-zinc-400">кг</span></span>
                  </div>
                  <div className="text-zinc-500 font-bold text-lg">→</div>
                  <div>
                    <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                      {isRu ? "Цель" : "Ziel"}
                    </span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(e.target.value)}
                        className="w-16 bg-zinc-800 text-center font-black text-xl rounded-lg py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 text-white"
                      />
                      <span className="text-xs font-medium text-zinc-400">кг</span>
                    </div>
                  </div>
                </div>

                {/* Goal Selector */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                    {isRu ? "Направление" : "Richtung"}
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: "gain", labelRu: "Набор массы (+500 ккал)", labelDe: "Gewicht zunehmen (+500 kcal)", descRu: "Оптимально для безопасного набора", descDe: "Optimal für gesunde Zunahme" },
                      { id: "maintain", labelRu: "Удержание веса (Норма)", labelDe: "Gewicht halten", descRu: "Сохранение текущих показателей", descDe: "Halten des aktuellen Gewichts" },
                      { id: "lose", labelRu: "Снижение веса (-500 ккал)", labelDe: "Gewicht abnehmen (-500 kcal)", descRu: "Плавный дефицит калорий", descDe: "Sanftes Kaloriendefizit" }
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGoal(g.id)}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          goal === g.id
                            ? "bg-zinc-950 text-white border-zinc-950 shadow-sm"
                            : "bg-white text-zinc-950 border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        <div>
                          <span className="block text-xs font-bold">{isRu ? g.labelRu : g.labelDe}</span>
                          <span className={`text-[10px] ${goal === g.id ? "text-zinc-400" : "text-zinc-500"}`}>
                            {isRu ? g.descRu : g.descDe}
                          </span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                          goal === g.id ? "bg-white text-zinc-950 border-white" : "border-zinc-300"
                        }`}>
                          {goal === g.id ? "✓" : ""}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity Level Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    {isRu ? "Уровень активности" : "Aktivitätslevel"}
                  </label>
                  <select
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-all"
                  >
                    <option value="1.2">{isRu ? "Малоподвижный (сидячая работа)" : "Wenig aktiv (Sitzende Tätigkeit)"}</option>
                    <option value="1.375">{isRu ? "Умеренная активность (1-3 тренировки/нед)" : "Mäßig aktiv (1-3 Workouts/Woche)"}</option>
                    <option value="1.55">{isRu ? "Высокая активность (4-5 тренировок/нед)" : "Sehr aktiv (4-5 Workouts/Woche)"}</option>
                    <option value="1.8">{isRu ? "Очень высокая (тяжёлый труд / ежедневный спорт)" : "Extrem aktiv (Tägliches Training)"}</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Action Buttons */}
      {!isSubmitting && (
        <div className="pt-6 border-t border-zinc-100 mt-6 flex space-x-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="py-3.5 px-5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs transition-all active:scale-[0.98]"
            >
              {isRu ? "Назад" : "Zurück"}
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => (step === 1 ? setStep(2) : handleNextStep2())}
              className="flex-1 py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition-all active:scale-[0.98] shadow-md shadow-zinc-950/10"
            >
              {step === 1 ? (isRu ? "Начать" : "Starten") : (isRu ? "Далее" : "Weiter")}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition-all active:scale-[0.98] shadow-md shadow-zinc-950/10"
            >
              {isRu ? "Создать мой план" : "Meinen Plan erstellen"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
