import React, { useState, useCallback, useEffect } from "react";
import CalorieCounter from "./components/CalorieCounter";
import MealCard from "./components/MealCard";
import AIChat from "./components/AIChat";
import OnboardingScreen from "./components/OnboardingScreen";
import changelogData from "../changelog.json";
import { calculateTargetMacros, calculateEatenMacros } from "./utils/macros";
import { Utensils, LineChart, Calendar, User, MessageCircle } from "lucide-react";

const DATA_VERSION = changelogData.current_version; // bump to invalidate older meal format cache

function addMinutesToTime(timeStr, minutesToAdd) {
  if (!timeStr) return "00:00";
  const [h, m] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m + minutesToAdd, 0, 0);
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function subtractMinutesFromTime(timeStr, minutesToSubtract) {
  if (!timeStr) return "00:00";
  const [h, m] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m - minutesToSubtract, 0, 0);
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

const mealSections = [
  { key: "breakfast" },
  { key: "lunch" },
  { key: "snack" },
  { key: "night" },
];

const translations = {
  de: {
    dayProgress: "Tagesfortschritt",
    ofTarget: "von {target} kcal Tagesziel",
    breakfast: "Frühstück",
    lunch: "Hauptmahlzeit",
    snack: "Nachmittagssnack",
    night: "Nachtsnack",
    silent: "Silent",
    less: "Weniger anzeigen",
    ingredientsAndRecipe: "Zutaten & Rezept",
    shoppingList: "Einkaufsliste",
    recipe: "Rezept",
    reroll: "Reroll",
    rerolling: "Rerolling…",
    zutatenLabel: "Zutaten",
    settingsTitle: "Zeitplan & Wecker",
    resetAccount: "Alle Daten löschen",
    wakeLabel: "Aufstehzeit",
    bedLabel: "Schlafenszeit",
    notifyLabel: "Telegram-Benachrichtigungen",
    remindLabel: "Erinnerung 1 Stunde vorher",
    
    targetCal: "Ziel: {target} kcal | Geplantes Menü: {total} kcal",
    deficit: "Defizit: {diff} kcal",
    surplus: "Überschuss: {diff} kcal",
    
    onboardingTitle: "Persönliche Einrichtung",
    onboardingSubtitle: "Gib deine Daten ein, um deinen täglichen Kalorienbedarf zu berechnen.",
    genderLabel: "Geschlecht",
    genderM: "M",
    genderF: "W",
    ageLabel: "Alter (Jahre)",
    heightLabel: "Größe (cm)",
    weightLabel: "Gewicht (kg)",
    activityLabel: "Aktivitätslevel",
    activity1: "Sedentär (1.2) - Wenig Bewegung",
    activity2: "Moderat (1.5) - Mäßig aktiv",
    activity3: "Aktiv (1.8) - Sehr aktiv",
    goalLabel: "Dein Ziel",
    goalGain: "Aufbau (+500 kcal)",
    goalMaintain: "Halten (0 kcal)",
    goalLose: "Abnehmen (-500 kcal)",
    submitBtn: "Berechnen & Starten",
    profileTitle: "Profil & Ziele",
    aiAnalysisTitle: "KI-Ernährungsanalyse",
    regenerateTitle: "Tagesplan über KI regenerieren",
    regeneratingTitle: "KI generiert Plan...",
    aiError: "Fehler: KI konnte die Aktion nicht ausführen.",
    promptGuardWarning: "Warnung: Nur ernährungsbezogene Daten in deutscher Sprache erlaubt!",
    
    readyToEatBtn: "Fertiggericht",
    readyToEatReplacing: "Ersetze...",
    shoppingListTitle: "Einkaufsliste fur heute",
    weightAnalytics: "Gewichtsverlauf",
    weightInputPlaceholder: "Gewicht (kg)",
    weightLogBtn: "Eintragen",
    idealWeightText: "(Idealgewicht fur {height} cm: {ideal} kg)",
    remToGoal: "Noch {diff} kg bis zum Ziel",
    dynamicsWeek: "Gewichtsverlauf-Trend",
    noWeightData: "Trage dein Gewicht ein, um den Verlauf zu sehen",
  },
  ru: {
    dayProgress: "Прогресс за день",
    ofTarget: "из {target} ккал цели на день",
    breakfast: "Завтрак",
    lunch: "Обед",
    snack: "Полдник / Перекус",
    night: "Ночной перекус",
    silent: "Тихий режим",
    less: "Свернуть",
    ingredientsAndRecipe: "Ингредиенты и рецепт",
    shoppingList: "Список покупок",
    recipe: "Рецепт",
    reroll: "Сбросить",
    rerolling: "Сброс...",
    zutatenLabel: "ингредиентов",
    settingsTitle: "Режим дня и уведомления",
    wakeLabel: "Время подъема",
    bedLabel: "Время сна (отбоя)",
    notifyLabel: "Уведомления в Telegram",
    remindLabel: "Напоминать за 1 час",
    
    targetCal: "Цель: {target} ккал | Запланировано меню: {total} ккал",
    deficit: "Недобор: {diff} ккал",
    surplus: "Перебор: {diff} ккал",
    
    onboardingTitle: "Первичная настройка",
    onboardingSubtitle: "Укажите ваши параметры для расчета индивидуального плана калорий.",
    genderLabel: "Пол",
    genderM: "М",
    genderF: "Ж",
    ageLabel: "Возраст (лет)",
    heightLabel: "Рост (см)",
    weightLabel: "Текущий вес (кг)",
    activityLabel: "Уровень активности",
    activity1: "Сидячий (1.2) - Минимальный спорт",
    activity2: "Умеренный (1.5) - Средняя активность",
    activity3: "Активный (1.8) - Регулярный спорт",
    goalLabel: "Ваша цель",
    goalGain: "Набор массы (+500 ккал)",
    goalMaintain: "Удержание веса (0 ккал)",
    goalLose: "Похудение (-500 ккал)",
    submitBtn: "Рассчитать и начать",
    profileTitle: "Профиль и цель",
    aiAnalysisTitle: "Анализ рациона от ИИ",
    regenerateTitle: "Обновить меню через AI",
    regeneratingTitle: "AI подбирает меню...",
    aiError: "Ошибка: ИИ не смог выполнить действие.",
    promptGuardWarning: "Предупреждение: Допускаются только диетические запросы на немецком языке!",
    
    readyToEatBtn: "Купить готовое",
    readyToEatReplacing: "Замена...",
    shoppingListTitle: "Список покупок на сегодня",
    weightAnalytics: "История веса",
    weightInputPlaceholder: "Вес (кг)",
    weightLogBtn: "Записать",
    idealWeightText: "(ИИ-идеальный вес под рост {height} см: {ideal} кг)",
    remToGoal: "Осталось до цели: {diff} кг",
    dynamicsWeek: "Динамика веса",
    noWeightData: "Запишите вес ниже, чтобы построить график",
  }
};

// --- AI Autonomous Audit: Error Boundary ---
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorStr: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorStr: error?.toString() || 'Unknown render error' };
  }

  componentDidCatch(error, errorInfo) {
    console.error("GlobalErrorBoundary caught an error:", error, errorInfo);
    try {
      // Find userId if possible from window or localStorage
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      const uid = tgUser?.id || localStorage.getItem("gain-tracker-last-user") || 'unknown';
      fetch('/api/system/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          logType: 'render_bug',
          message: error?.toString() || 'Render Error',
          stackTrace: errorInfo?.componentStack || error?.stack || '',
          context: 'GlobalErrorBoundary'
        })
      });
    } catch(e) {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 p-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-800 mb-2">Ой, интерфейс сломался</h2>
          <p className="text-sm text-zinc-500 mb-6">
            ИИ-разработчик уже получил отчет об ошибке ({this.state.errorStr}) и скоро все починит!
          </p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-full">
            Перезагрузить приложение
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppWrapper() {
  return (
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  );
}

function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const userId = tgUser?.id || searchParams.get("tgUserId") || "12345";

  // Жесткая изоляция кэша: удаляем данные, если зашел другой пользователь
  if (userId) {
    const lastUserId = localStorage.getItem("gain-tracker-last-user");
    if (lastUserId && String(userId) !== String(lastUserId)) {
      localStorage.removeItem("gain-tracker-profile");
      localStorage.removeItem("gain-tracker-meals");
      localStorage.removeItem("gain-tracker-schedule");
      localStorage.removeItem("gain-tracker-eaten");
      localStorage.removeItem("gain-tracker-weight-history");
      localStorage.removeItem("gain-tracker-date");
      localStorage.removeItem("gain-tracker-version");
    }
    localStorage.setItem("gain-tracker-last-user", String(userId));
  }

  // --- AI Autonomous Audit: Global Listeners ---
  useEffect(() => {
    const handleGlobalError = (event) => {
      let msg = event.message || event.error?.toString() || 'Unknown Error';
      fetch('/api/system/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'unknown',
          logType: 'error',
          message: msg,
          stackTrace: event.error?.stack || '',
          context: `window.onerror at ${event.filename}:${event.lineno}:${event.colno}`
        })
      }).catch(() => {});
    };

    const handleUnhandledRejection = (event) => {
      fetch('/api/system/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'unknown',
          logType: 'error',
          message: event.reason?.message || event.reason?.toString() || 'Unhandled Rejection',
          stackTrace: event.reason?.stack || '',
          context: 'unhandledrejection'
        })
      }).catch(() => {});
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [userId]);

  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("gain-tracker-lang");
    if (saved === "de" || saved === "ru") return saved;
    const tgLang = tgUser?.language_code;
    return tgLang === "de" ? "de" : "ru";
  });

  useEffect(() => {
    localStorage.setItem("gain-tracker-lang", lang);
  }, [lang]);

  const [profile, setProfile] = useState(() => {
    if (!tgUser?.id) {
      const saved = localStorage.getItem("gain-tracker-profile");
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return null;
  });


  const [schedule, setSchedule] = useState(() => {
    if (!tgUser?.id) {
      const saved = localStorage.getItem("gain-tracker-schedule");
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return {
      wakeTime: "08:00",
      bedTime: "23:00",
      notifications: true,
      remind1h: true,
    };
  });

  const [meals, setMeals] = useState(() => {
    if (!tgUser?.id) {
      const saved = localStorage.getItem("gain-tracker-meals");
      const savedDate = localStorage.getItem("gain-tracker-date");
      const savedVersion = localStorage.getItem("gain-tracker-version");
      const today = new Date().toDateString();
      if (saved && savedDate === today && savedVersion === DATA_VERSION.toString()) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return null;
  });

  const [eatenMeals, setEatenMeals] = useState(() => {
    if (!tgUser?.id) {
      const saved = localStorage.getItem("gain-tracker-eaten");
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return [];
  });

  const [isLoaded, setIsLoaded] = useState(!tgUser?.id);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [changelog, setChangelog] = useState(null);
  const [weightHistory, setWeightHistory] = useState(() => {
    if (!tgUser?.id) {
      const saved = localStorage.getItem("gain-tracker-weight-history");
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return [];
  });
  const [globalAnalytics, setGlobalAnalytics] = useState({
    eatenCount: 0,
    eatenCalories: 0,
    missedCount: 0,
    missedCalories: 0
  });
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsFailed, setGpsFailed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [todayScannedCalories, setTodayScannedCalories] = useState(0);

  const handleFoodLogged = useCallback((foodData) => {
    if (foodData && foodData.calories) {
      setTodayScannedCalories(prev => prev + foodData.calories);
      setGlobalAnalytics(prev => ({
        ...prev,
        eatenCalories: prev.eatenCalories + foodData.calories,
        eatenCount: prev.eatenCount + 1
      }));
    }
  }, []);
  const [onboardingError, setOnboardingError] = useState("");
  const [weightInputVal, setWeightInputVal] = useState("");
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000); // Check every 15s to be precise
    return () => clearInterval(timer);
  }, []);

  const isTimePassed = useCallback((timeStr) => {
    if (!timeStr) return false;
    const [h, m] = timeStr.split(":").map(Number);
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    
    if (currentHours > h) return true;
    if (currentHours === h && currentMinutes >= m) return true;
    return false;
  }, [currentTime]);

  const [activeTab, setActiveTab] = useState("timeline");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  const [editProfileForm, setEditProfileForm] = useState({
    gender: "M",
    age: "",
    height: "",
    weight: "",
    activity: "1.2",
    goal: "gain",
  });

  useEffect(() => {
    if (profile) {
      setEditProfileForm({
        gender: profile.gender || "M",
        age: profile.age ? profile.age.toString() : "",
        height: profile.height ? profile.height.toString() : "",
        weight: profile.weight ? profile.weight.toString() : "",
        activity: profile.activity ? profile.activity.toString() : "1.2",
        goal: profile.goal || "gain",
      });
    }
  }, [profile]);


  const handleResetAccount = async () => {
    if (!window.confirm("Вы уверены, что хотите полностью удалить свой профиль и все данные? Это действие необратимо.")) {
      return;
    }
    try {
      const res = await fetch(`/api/profile?userId=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        localStorage.clear();
        setProfile(null);
        setMeals(null);
        window.location.reload();
      } else {
        alert("Ошибка при удалении профиля. Попробуйте позже.");
      }
    } catch (e) {
      alert("Ошибка сети. Проверьте подключение.");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          gender: editProfileForm.gender,
          age: parseInt(editProfileForm.age, 10) || 0,
          height: parseInt(editProfileForm.height, 10) || 0,
          weight: parseFloat(editProfileForm.weight) || 0,
          activity: parseFloat(editProfileForm.activity) || 0,
          goal: editProfileForm.goal,
          lang
        })
      });
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error: " + res.status);
      }
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        
        // Log weight to history state
        const todayStr = `${String(new Date().getDate()).padStart(2, "0")}.${String(new Date().getMonth() + 1).padStart(2, "0")}`;
        setWeightHistory(prev => {
          const filtered = prev.filter(w => w.date !== todayStr);
          const newHistory = [...filtered, { date: todayStr, weight: parseFloat(editProfileForm.weight) }];
          return newHistory.sort((a,b) => {
            const [da, ma] = a.date.split(".").map(Number);
            const [db, mb] = b.date.split(".").map(Number);
            return (ma * 100 + da) - (mb * 100 + db);
          });
        });
      }
    } catch (err) {
      console.error("Failed to save profile changes:", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const res = await fetch("/api/profile/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error: " + res.status);
      }
      const data = await res.json();
      if (data.success && profile) {
        setProfile(prev => ({
          ...prev,
          subscriptionStatus: data.subscriptionStatus,
          subscriptionExpiresAt: data.subscriptionExpiresAt
        }));
      }
    } catch (err) {
      console.error("Subscription failed:", err);
    } finally {
      setIsSubscribing(false);
    }
  };

  // Helper to generate a flat line weight history matching profile weight
  const getInitialHistory = useCallback((weight) => {
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}`;
    return [{ date: dateStr, weight: parseFloat(weight) }];
  }, []);

  const [isNewUser, setIsNewUser] = useState(false);

  const [onboardingForm, setOnboardingForm] = useState({
    gender: "M",
    age: "",
    height: "",
    weight: "",
    activity: "1.2",
    goal: "gain",
  });

  // Load state from VDS API on mount
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch(`/api/meals?userId=${userId}`);
        if (!res.ok) throw new Error("HTTP error " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server error: " + res.status);
        }
        const data = await res.json();
        
        if (data.isNewUser || !data.profile) {
          setIsNewUser(true);
        } else {
          setIsNewUser(false);
        }

        if (data.profile) {
          setProfile(data.profile);
        }
        if (data.meals) {
          setMeals(data.meals);
        }
        if (data.schedule && Object.keys(data.schedule).length > 0) {
          setSchedule(prev => ({ ...prev, ...data.schedule }));
        }
        if (data.eatenMeals) {
          setEatenMeals(data.eatenMeals);
        }
        if (data.weightHistory && data.weightHistory.length > 0) {
          setWeightHistory(data.weightHistory);
        } else if (data.profile && data.profile.weight) {
          setWeightHistory(getInitialHistory(data.profile.weight));
        }
        if (data.globalAnalytics) {
          setGlobalAnalytics(data.globalAnalytics);
        }
        if (data.todayScannedCalories !== undefined) {
          setTodayScannedCalories(data.todayScannedCalories);
        }
        
        // Fetch AI changelog on mount
        try {
          const changelogRes = await fetch(`/api/changelog?version=${DATA_VERSION}&userId=${userId}`);
          if (changelogRes.ok) {
            const changelogContentType = changelogRes.headers.get("content-type");
            if (!changelogContentType || !changelogContentType.includes("application/json")) {
              throw new Error("Server error: " + changelogRes.status);
            }
            const changelogData = await changelogRes.json();
            setChangelog(changelogData);
          }
        } catch (err) {
          console.error("Failed to fetch changelog", err);
        }
      } catch (err) {
        console.error("Failed to fetch state from API:", err);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchState();
  }, [userId, tgUser]);

  const handleOnboardingComplete = useCallback(async (onboardingData) => {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...onboardingData
        })
      });
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error: " + res.status);
      }
      const profileData = await res.json();
      if (profileData.profile) {
        setProfile(profileData.profile);
      }

      // Fetch newly generated meal plan
      const mealsRes = await fetch(`/api/meals?userId=${userId}&regenerate=true`);
      if (mealsRes.ok) {
        const mContentType = mealsRes.headers.get("content-type");
        if (mContentType && mContentType.includes("application/json")) {
          const mData = await mealsRes.json();
          if (mData.meals) {
            setMeals(mData.meals);
          }
          if (mData.globalAnalytics) {
            setGlobalAnalytics(mData.globalAnalytics);
          }
        }
      }
      setIsNewUser(false);
    } catch (err) {
      console.error("Onboarding completion failed:", err);
      alert("Error creating profile: " + err.message);
    }
  }, [userId]);

  // Persist schedule, meals, profile, and eaten state updates
  useEffect(() => {
    if (!isLoaded) return;

    const timer = setTimeout(() => {
      const persistState = async () => {
        if (!meals || Object.keys(meals).length === 0) return;
        const today = new Date().toDateString();
        try {
            const res = await fetch("/api/meals", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                meals,
                date: today,
                version: DATA_VERSION,
                schedule,
                profile,
                eatenMeals,
                weightHistory,
                tzOffset: new Date().getTimezoneOffset()
              })
            });
            if (res.ok) {
              const contentType = res.headers.get("content-type");
              if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server error: " + res.status);
              }
              const data = await res.json();
              if (data.globalAnalytics) {
                setGlobalAnalytics(data.globalAnalytics);
              }
            }
          } catch (err) {
            console.error("Failed to save state to API:", err);
          }
          
          localStorage.setItem("gain-tracker-meals", JSON.stringify(meals));
          localStorage.setItem("gain-tracker-date", today);
          localStorage.setItem("gain-tracker-version", DATA_VERSION.toString());
          localStorage.setItem("gain-tracker-schedule", JSON.stringify(schedule));
          localStorage.setItem("gain-tracker-eaten", JSON.stringify(eatenMeals));
          localStorage.setItem("gain-tracker-weight-history", JSON.stringify(weightHistory));
          if (profile) {
            localStorage.setItem("gain-tracker-profile", JSON.stringify(profile));
          }
      };
      persistState();
    }, 1500);
    return () => clearTimeout(timer);
  }, [schedule, meals, profile, eatenMeals, weightHistory, userId, isLoaded, tgUser]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor("#FFFFFF");
      tg.setBackgroundColor("#F5F5F7");
    }
  }, []);

  const totalCalories =
    (meals?.breakfast?.calories || 0) +
    (meals?.lunch?.calories || 0) +
    (meals?.snack?.calories || 0) +
    (meals?.night?.calories || 0);

  const eatenCalories =
    (eatenMeals.includes("breakfast") ? (meals?.breakfast?.calories || 0) : 0) +
    (eatenMeals.includes("lunch") ? (meals?.lunch?.calories || 0) : 0) +
    (eatenMeals.includes("snack") ? (meals?.snack?.calories || 0) : 0) +
    (eatenMeals.includes("night") ? (meals?.night?.calories || 0) : 0) +
    todayScannedCalories;

  const targetCalories = profile?.targetCalories || 3000;

  const targetMacros = React.useMemo(() => {
    return calculateTargetMacros(profile?.weight || 70, targetCalories);
  }, [profile?.weight, targetCalories]);

  const eatenMacros = React.useMemo(() => {
    return calculateEatenMacros(meals, eatenMeals, targetCalories, targetMacros);
  }, [meals, eatenMeals, targetCalories, targetMacros]);

  // Single meal local reroll fallback (random select from correct goal pool)
  const handleReroll = useCallback(async (section) => {
    if (!profile) return;
    try {
      const res = await fetch(`/api/meals?userId=${userId}&regenerate=true&section=${section}`);
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server error: " + res.status);
        }
        const data = await res.json();
        if (data.meals && data.meals[section]) {
          setMeals(prev => ({
            ...prev,
            [section]: data.meals[section]
          }));
          // Reset checked state for the single meal being rerolled
          setEatenMeals(prev => prev.filter(s => s !== section));
        }
      }
    } catch (err) {
      console.error("Local reroll failed", err);
    }
  }, [profile, userId]);

  // Replace a meal with an AI-generated Ready-to-Eat alternative from German supermarkets
  const handleReplaceReady = useCallback(async (section) => {
    if (!profile) return;
    try {
      const res = await fetch("/api/meals/replace-ready", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, section, lang })
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server error: " + res.status);
        }
        const data = await res.json();
        if (data.meal) {
          setMeals(prev => ({
            ...prev,
            [section]: data.meal
          }));
          // Reset checked state for the single meal being replaced
          setEatenMeals(prev => prev.filter(s => s !== section));
        }
      }
    } catch (err) {
      console.error("Ready-to-eat replacement failed", err);
    }
  }, [profile, userId, lang]);

  // Log weight entry into history
  const logWeight = useCallback((weightVal) => {
    const parsedWeight = parseFloat(weightVal);
    if (isNaN(parsedWeight) || parsedWeight <= 0) return;
    
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}`;
    
    setWeightHistory(prev => {
      const existingIdx = prev.findIndex(item => item.date === dateStr);
      let updated;
      if (existingIdx !== -1) {
        updated = [...prev];
        updated[existingIdx].weight = parsedWeight;
      } else {
        updated = [...prev, { date: dateStr, weight: parsedWeight }];
      }
      if (updated.length > 10) {
        updated = updated.slice(updated.length - 10);
      }
      return updated;
    });
  }, []);

  // --- Shopping List Aggregator ---
  const [checkedShoppingItems, setCheckedShoppingItems] = useState(() => {
    const saved = localStorage.getItem("gain-tracker-shopping-checked");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("gain-tracker-shopping-checked", JSON.stringify(checkedShoppingItems));
  }, [checkedShoppingItems]);

  useEffect(() => {
    setCheckedShoppingItems({});
  }, [meals]);

  const aggregatedShoppingItems = React.useMemo(() => {
    if (!meals) return [];
    const list = [];
    const sections = ["breakfast", "lunch", "snack", "night"];
    sections.forEach(sec => {
      const meal = meals[sec];
      if (meal) {
        const items = lang === "ru" ? (meal.products_ru || []) : (meal.products_de || []);
        list.push(...items);
      }
    });
    return Array.from(new Set(list));
  }, [meals, lang]);

  // --- SaaS Analytics calculations ---
  const heightVal = profile?.height || 180;
  const genderVal = profile?.gender || "M";
  
  const idealWeight = React.useMemo(() => {
    const heightInches = heightVal / 2.54;
    const inchesOver5Feet = Math.max(0, heightInches - 60);
    const baseWeight = genderVal === "M" ? 50.0 : 45.5;
    return Math.round(baseWeight + 2.3 * inchesOver5Feet);
  }, [heightVal, genderVal]);



  const remToIdeal = React.useMemo(() => {
    if (weightHistory.length === 0) return "0.0";
    const currentWeight = weightHistory[weightHistory.length - 1].weight;
    return Math.abs(currentWeight - idealWeight).toFixed(1);
  }, [weightHistory, idealWeight]);

  const weightTrend = React.useMemo(() => {
    if (weightHistory.length < 2) return null;
    const first = weightHistory[0].weight;
    const last = weightHistory[weightHistory.length - 1].weight;
    const diff = last - first;
    // Check if the dynamics is just a flat line
    if (diff === 0) return null;
    return {
      diff: diff.toFixed(1),
      isGain: diff > 0,
      isEqual: diff === 0
    };
  }, [weightHistory]);



  // Full day AI-powered menu regeneration endpoint
  const handleRegenerateMenu = async () => {
    if (!profile) return;
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/meals?userId=${userId}&regenerate=true`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error: " + res.status);
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Generation error");
      }
      const data = await res.json();
      if (data.meals) {
        setMeals(data.meals);
        setEatenMeals([]); // reset eaten meals
      }
      if (data.globalAnalytics) {
        setGlobalAnalytics(data.globalAnalytics);
      }
    } catch (err) {
      alert(`${translations[lang].aiError}\n${err.message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleToggleEaten = (section) => {
    setEatenMeals((prev) => {
      const updated = prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section];
      return updated;
    });
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setOnboardingError("");
    setIsLoaded(false);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          gender: onboardingForm.gender,
          age: onboardingForm.age,
          height: onboardingForm.height,
          weight: onboardingForm.weight,
          activity: onboardingForm.activity,
          goal: onboardingForm.goal,
          lang
        })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error: " + res.status);
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to calculate profile");
      }

      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setWeightHistory(getInitialHistory(data.profile.weight));
        
        // Immediately generate initial meals
        const mealsRes = await fetch(`/api/meals?userId=${userId}&regenerate=true`);
        if (mealsRes.ok) {
          const mealsContentType = mealsRes.headers.get("content-type");
          if (!mealsContentType || !mealsContentType.includes("application/json")) {
            throw new Error("Server error: " + mealsRes.status);
          }
          const mealsData = await mealsRes.json();
          if (mealsData.meals) {
            setMeals(mealsData.meals);
            setEatenMeals([]); // reset eaten meals
          }
        }
      }
    } catch (err) {
      setOnboardingError(err.message);
    } finally {
      setIsLoaded(true);
    }
  };

  const sendGpsToServer = async (lat, lon) => {
    setIsLocating(true);
    try {
      const res = await fetch('/api/profile/gps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, lat, lon })
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server error: " + res.status);
        }
        const data = await res.json();
        if (data && data.profile) {
          setProfile(prev => prev ? {
            ...prev,
            country: data.profile.country || prev.country,
            region_name: data.profile.region_name || prev.region_name,
            city: data.profile.city || prev.city
          } : data.profile);
        }
      } else {
        throw new Error("HTTP error " + res.status);
      }
    } catch (err) {
      console.error("GPS reverse geocoding update failed:", err);
      alert(lang === "ru" ? `Ошибка определения локации: ${err.message}` : `Location resolution error: ${err.message}`);
    } finally {
      setIsLocating(false);
    }
  };

  const handleLocateSupermarkets = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.Location?.requestPermission) {
      tg.Location.requestPermission((hasAccess) => {
        if (hasAccess) {
          tg.Location.getLocation((data) => {
            if (data && data.latitude) {
              sendGpsToServer(data.latitude, data.longitude);
            } else {
              setGpsFailed(true);
            }
          });
        } else {
          setGpsFailed(true);
        }
      });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          sendGpsToServer(latitude, longitude);
        },
        (error) => {
          console.error("Browser Geolocation failed:", error);
          setGpsFailed(true);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGpsFailed(true);
    }
  };

  const handleSendGeoViaChat = async () => {
    setIsLocating(true);
    try {
      const res = await fetch('/api/profile/trigger-geo-button', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        const tg = window.Telegram?.WebApp;
        if (tg && typeof tg.close === 'function') {
          tg.close();
        } else {
          alert(lang === "ru" 
            ? "Запрос отправлен в чат-бота! Пожалуйста, перейдите в чат с ботом и поделитесь локацией." 
            : "Request sent to chat bot! Please go to your chat with the bot and share your location.");
        }
      } else {
        throw new Error("Trigger endpoint failed");
      }
      } finally {
        setIsLocating(false);
      }
    };

  // Sync profile edits with server calculations
  const updateProfileOnServer = async (updatedProfile) => {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          gender: updatedProfile.gender,
          age: updatedProfile.age,
          height: updatedProfile.height,
          weight: updatedProfile.weight,
          activity: updatedProfile.activity,
          goal: updatedProfile.goal,
          lang
        })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error: " + res.status);
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Profile calculation error");
      }

      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        
        // Auto-regenerate meals to align with the new profile target immediately
        const mealsRes = await fetch(`/api/meals?userId=${userId}&regenerate=true`);
        if (mealsRes.ok) {
          const mealsContentType = mealsRes.headers.get("content-type");
          if (!mealsContentType || !mealsContentType.includes("application/json")) {
            throw new Error("Server error: " + mealsRes.status);
          }
          const mealsData = await mealsRes.json();
          if (mealsData.meals) {
            setMeals(mealsData.meals);
            setEatenMeals([]); // reset eaten meals
          }
        }
      }
    } catch (err) {
      alert(`${translations[lang].aiError}\n${err.message}`);
    }
  };

  const handleProfileFieldBlur = (field, value) => {
    if (!profile) return;
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    updateProfileOnServer(updated);
  };

  const handleProfileSelectChange = (field, value) => {
    if (!profile) return;
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    updateProfileOnServer(updated);
  };

  const dateStr = new Date().toLocaleDateString(lang === "ru" ? "ru-RU" : "de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const breakfastTime = addMinutesToTime(schedule.wakeTime, 90);
  const lunchTime = addMinutesToTime(schedule.wakeTime, 420);
  const snackTime = addMinutesToTime(schedule.wakeTime, 600);
  const nightTime = subtractMinutesFromTime(schedule.bedTime, 60);

  const mealTimes = {
    breakfast: breakfastTime,
    lunch: lunchTime,
    snack: snackTime,
    night: nightTime,
  };

  const lostCalories = React.useMemo(() => {
    if (!meals) return 0;
    let lost = 0;
    mealSections.forEach(sec => {
      const meal = meals[sec.key];
      const time = mealTimes[sec.key];
      if (meal && time && isTimePassed(time) && !eatenMeals.includes(sec.key)) {
        lost += meal.calories;
      }
    });
    return lost;
  }, [meals, eatenMeals, mealTimes, isTimePassed]);

  const missedMealsCount = React.useMemo(() => {
    if (!meals) return 0;
    let count = 0;
    mealSections.forEach(sec => {
      const meal = meals[sec.key];
      const time = mealTimes[sec.key];
      if (meal && time && isTimePassed(time) && !eatenMeals.includes(sec.key)) {
        count += 1;
      }
    });
    return count;
  }, [meals, eatenMeals, mealTimes, isTimePassed]);

  // --- Loading Screen ---
  if (isLoaded && !userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h2 className="text-xl font-bold text-zinc-800 mb-2">Откройте через Telegram</h2>
        <p className="text-sm text-zinc-500">
          Приложение запущено вне Telegram WebApp (возможно, по прямой ссылке). Пожалуйста, вернитесь в бота и нажмите кнопку "Открыть приложение" (Menu).
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" />
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            {lang === "ru" ? "Загрузка" : "Laden"}<span className="dots" />
          </span>
        </div>
      </div>
    );
  }

  // âââ Onboarding Form âââ
  if (isLoaded && !profile) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto w-full">
          <div className="flex justify-end mb-4">
            <div className="relative flex items-center bg-zinc-200/50 p-0.5 rounded-lg w-[72px] h-[26px]">
              <div
                className="absolute top-0.5 bottom-0.5 rounded-[6px] bg-white shadow-sm transition-all duration-300 ease-out"
                style={{
                  left: lang === "de" ? "2px" : "36px",
                  width: "34px",
                }}
              />
              <button
                onClick={() => setLang("de")}
                className={`relative z-10 w-1/2 text-[10px] font-bold transition-colors duration-200 ${
                  lang === "de" ? "text-zinc-800" : "text-zinc-400"
                }`}
              >
                DE
              </button>
              <button
                onClick={() => setLang("ru")}
                className={`relative z-10 w-1/2 text-[10px] font-bold transition-colors duration-200 ${
                  lang === "ru" ? "text-zinc-800" : "text-zinc-400"
                }`}
              >
                RU
              </button>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
                {translations[lang].onboardingTitle}
              </h2>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                {translations[lang].onboardingSubtitle}
              </p>
            </div>

            {onboardingError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold">
                {translations[lang].promptGuardWarning}
                <div className="mt-1 font-normal opacity-90">{onboardingError}</div>
              </div>
            )}

            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              {/* Gender Segmented Switch */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  {translations[lang].genderLabel}
                </label>
                <div className="relative flex bg-zinc-100 p-1 rounded-xl h-[42px] border border-zinc-200/40">
                  <div
                    className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-out"
                    style={{
                      left: onboardingForm.gender === "M" ? "4px" : "calc(50% + 0px)",
                      width: "calc(50% - 4px)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setOnboardingForm(prev => ({ ...prev, gender: "M" }))}
                    className={`relative z-10 w-1/2 text-sm font-semibold transition-colors duration-200 ${
                      onboardingForm.gender === "M" ? "text-[#1D1D1F]" : "text-zinc-400"
                    }`}
                  >
                    {translations[lang].genderM}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingForm(prev => ({ ...prev, gender: "F" }))}
                    className={`relative z-10 w-1/2 text-sm font-semibold transition-colors duration-200 ${
                      onboardingForm.gender === "F" ? "text-[#1D1D1F]" : "text-zinc-400"
                    }`}
                  >
                    {translations[lang].genderF}
                  </button>
                </div>
              </div>

              {/* Age, Height, Weight inputs */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    {translations[lang].ageLabel.split(" ")[0]}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={onboardingForm.age}
                    onChange={e => setOnboardingForm(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm bg-zinc-50 font-medium text-[#1D1D1F] focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    placeholder="25"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    {translations[lang].heightLabel.split(" ")[0]} (cm)
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    max="250"
                    value={onboardingForm.height}
                    onChange={e => setOnboardingForm(prev => ({ ...prev, height: e.target.value }))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm bg-zinc-50 font-medium text-[#1D1D1F] focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    placeholder="180"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    {translations[lang].weightLabel.split(" ")[0]} (kg)
                  </label>
                  <input
                    type="number"
                    required
                    min="20"
                    max="300"
                    value={onboardingForm.weight}
                    onChange={e => setOnboardingForm(prev => ({ ...prev, weight: e.target.value }))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm bg-zinc-50 font-medium text-[#1D1D1F] focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    placeholder="75"
                  />
                </div>
              </div>

              {/* Activity Level Select */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  {translations[lang].activityLabel}
                </label>
                <select
                  value={onboardingForm.activity}
                  onChange={e => setOnboardingForm(prev => ({ ...prev, activity: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm bg-zinc-50 font-medium text-[#1D1D1F] focus:outline-none"
                >
                  <option value="1.2">{translations[lang].activity1}</option>
                  <option value="1.5">{translations[lang].activity2}</option>
                  <option value="1.8">{translations[lang].activity3}</option>
                </select>
              </div>

              {/* Goal Select */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  {translations[lang].goalLabel}
                </label>
                <select
                  value={onboardingForm.goal}
                  onChange={e => setOnboardingForm(prev => ({ ...prev, goal: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm bg-zinc-50 font-medium text-[#1D1D1F] focus:outline-none"
                >
                  <option value="gain">{translations[lang].goalGain}</option>
                  <option value="maintain">{translations[lang].goalMaintain}</option>
                  <option value="lose">{translations[lang].goalLose}</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#1D1D1F] hover:bg-zinc-800 text-white font-semibold rounded-xl active:scale-[0.98] transition-all text-sm mt-2 shadow-sm"
              >
                {translations[lang].submitBtn}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const chartWidth = 300;
  const chartHeight = 150;
  const marginLeft = 40;
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 30;
  
  const plottingWidth = chartWidth - marginLeft - marginRight;
  const plottingHeight = chartHeight - marginTop - marginBottom;
  
  const yMin = 40;
  const yMax = 100;
  const yRange = 60;
  const yLabels = [40, 50, 60, 70, 80, 90, 100];
  
  let chartBars = [];
  
  if (weightHistory.length > 0) {
    const colWidth = plottingWidth / weightHistory.length;
    const barWidth = Math.min(20, colWidth * 0.6);
    
    chartBars = weightHistory.map((w, idx) => {
      const weightVal = parseFloat(w.weight) || 0;
      const ratio = Math.max(0, Math.min(1, (weightVal - yMin) / yRange));
      const barHeight = ratio * plottingHeight || 0;
      
      const centerX = marginLeft + (idx + 0.5) * colWidth;
      const x = centerX - barWidth / 2;
      const y = (marginTop + plottingHeight) - barHeight;
      
      return {
        x,
        y,
        width: barWidth,
        height: barHeight,
        weight: w.weight,
        date: w.date,
        centerX
      };
    });
  }

  const isNewUserToday = profile?.createdAt && new Date(profile.createdAt).toDateString() === new Date().toDateString();
  const noMealsLogged = eatenMeals.length === 0;

  if (isLoaded && (isNewUser || !profile)) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} lang={lang} />;
  }

  // ─── Main Interface ───
  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-[#1D1D1F] tracking-tight leading-none">
              GainTracker
            </span>
            <span className="text-[10px] font-medium text-zinc-400 mt-1 capitalize">
              {dateStr}
            </span>
          </div>
          
          {/* iOS-style Segmented language selector */}
          <div className="relative flex items-center bg-zinc-100 p-0.5 rounded-lg w-[72px] h-[26px]">
            <div
              className="absolute top-0.5 bottom-0.5 rounded-[6px] bg-white shadow-sm transition-all duration-300 ease-out"
              style={{
                left: lang === "de" ? "2px" : "36px",
                width: "34px",
              }}
            />
            <button
              onClick={() => setLang("de")}
              className={`relative z-10 w-1/2 text-[10px] font-bold transition-colors duration-200 ${
                lang === "de" ? "text-zinc-800" : "text-zinc-400"
              }`}
            >
              DE
            </button>
            <button
              onClick={() => setLang("ru")}
              className={`relative z-10 w-1/2 text-[10px] font-bold transition-colors duration-200 ${
                lang === "ru" ? "text-zinc-800" : "text-zinc-400"
              }`}
            >
              RU
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5 pb-12">
        {activeTab === "timeline" && (
          <>
            {/* Locate Supermarkets banner */}
            {(!profile || !profile.city || profile.city === "Эссен" || profile.city.toLowerCase() === "essen") && (
              <div className="p-4 bg-zinc-50 border-l-2 border-zinc-800 border border-zinc-200 rounded-r-xl rounded-l-none mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <div className="text-xs font-semibold text-zinc-800">
                    {lang === "ru" ? "Точная привязка магазинов" : "Precise Supermarket Locator"}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {lang === "ru" 
                      ? (gpsFailed 
                          ? "Доступ к GPS заблокирован. Пожалуйста, отправьте координаты через нашего чат-бота."
                          : "Для точного подбора продуктов и готовых блюд в магазинах у дома (REWE, ALDI, LIDL) привяжите точную геолокацию.")
                      : (gpsFailed
                          ? "GPS access blocked. Please send your location via our Telegram chat bot."
                          : "To select correct products in local supermarkets (REWE, ALDI, LIDL), bind your precise location.")}
                  </div>
                </div>
                <button
                  disabled={isLocating}
                  onClick={gpsFailed ? handleSendGeoViaChat : handleLocateSupermarkets}
                  className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-60 text-white font-semibold rounded-lg text-xs active:scale-[0.98] transition-all shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>
                    {isLocating 
                      ? (lang === "ru" ? "Обработка..." : "Processing...") 
                      : (gpsFailed 
                          ? (lang === "ru" ? "Отправить через чат бота" : "Send via chat bot")
                          : (lang === "ru" ? "Найти магазины рядом" : "Find shops nearby"))}
                  </span>
                </button>
              </div>
            )}

            {/* Dashboard Calorie Card */}
            <CalorieCounter 
              eatenCalories={eatenCalories} 
              targetCalories={targetCalories} 
              totalCalories={totalCalories}
              lostCalories={lostCalories}
              translations={translations[lang]} 
            />

            {/* Shopping List panel */}
            {meals && aggregatedShoppingItems.length > 0 && (
              <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm mb-4 overflow-hidden">
                <button
                  onClick={() => setShowShoppingList(!showShoppingList)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-zinc-700">
                      {translations[lang].shoppingListTitle}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${showShoppingList ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showShoppingList && (
                  <div className="px-4 pb-4 border-t border-zinc-100 pt-4">
                    <div className="space-y-px">
                      {aggregatedShoppingItems.map((item, idx) => {
                        const isChecked = !!checkedShoppingItems[item];
                        return (
                          <label
                            key={idx}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 active:scale-[0.99]
                              ${isChecked ? "bg-zinc-50" : "hover:bg-zinc-50/60"}`}
                          >
                            <input
                              type="checkbox"
                              className="checkbox-custom"
                              checked={isChecked}
                              onChange={() => setCheckedShoppingItems(prev => ({ ...prev, [item]: !prev[item] }))}
                            />
                            <span className={`flex-1 text-[13px] transition-colors duration-150 ${
                              isChecked ? "line-through text-zinc-300" : "text-zinc-700"
                            }`}>
                              {item}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Regenerate Daily Menu via AI button */}
            <button
              onClick={handleRegenerateMenu}
              disabled={isRegenerating}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200/60 hover:bg-zinc-100/80 active:scale-[0.98] transition-all text-xs font-semibold text-zinc-600 mb-4 shadow-sm"
            >
              <svg
                className={`w-3.5 h-3.5 text-zinc-500 ${isRegenerating ? 'animate-spin' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span className="text-[11px] font-semibold text-zinc-600">
                {isRegenerating ? translations[lang].regeneratingTitle : translations[lang].regenerateTitle}
              </span>
            </button>

            {/* Meal Feed — Timeline */}
            {meals ? (
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-zinc-200" />

                <div className="space-y-4">
                  {mealSections.map((sec) => (
                    meals[sec.key] ? (
                      <MealCard
                        key={sec.key}
                        meal={meals[sec.key]}
                        section={sec.key}
                        label={translations[lang][sec.key]}
                        time={mealTimes[sec.key]}
                        onReroll={handleReroll}
                        isEaten={eatenMeals.includes(sec.key)}
                        onToggleEaten={() => handleToggleEaten(sec.key)}
                        lang={lang}
                        translations={translations[lang]}
                        onReplaceReady={handleReplaceReady}
                        isMissed={isTimePassed(mealTimes[sec.key])}
                      />
                    ) : null
                  ))}
                </div>
              </div>
            ) : (
              isRegenerating ? (
                <div className="text-center py-12 text-sm">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" />
                    <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                      {lang === "ru" ? "Генерируем меню через AI" : "Generiere Tagesplan über KI"}<span className="dots" />
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-white border border-zinc-200/80 rounded-xl p-6 shadow-sm">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                    {lang === "ru" ? "Рацион на сегодня не сгенерирован" : "Tagesplan für heute ist nicht generiert"}
                  </p>
                  <button
                    onClick={handleRegenerateMenu}
                    className="py-2 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition-all active:scale-[0.98]"
                  >
                    {lang === "ru" ? "Сгенерировать меню через AI" : "Tagesplan über KI generieren"}
                  </button>
                </div>
              )
            )}
          </>
        )}

        {activeTab === "analytics" && (
          <>
            {/* Premium SaaS weight line chart panel */}
            <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm p-5 mb-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1D1D1F]">
                    {translations[lang].weightAnalytics}
                  </h4>
                  <span className="text-[9px] font-semibold text-zinc-400 mt-0.5">
                    {translations[lang].idealWeightText.replace("{height}", heightVal).replace("{ideal}", idealWeight)}
                  </span>
                </div>
                {weightTrend && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    weightTrend.isGain 
                      ? "bg-zinc-100 text-zinc-800 border-zinc-200" 
                      : "bg-zinc-50 text-zinc-600 border-zinc-200/60"
                  }`}>
                    {weightTrend.isGain ? "+" : ""}{weightTrend.diff} kg
                  </span>
                )}
              </div>

              {/* Overhauled SVG line chart */}
              {(() => {
                console.log("Данные для графика из БД:", weightHistory);
                return weightHistory.length > 0 ? (
                  <div className="relative">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-[150px] overflow-visible">
                      {/* Horizontal coordinate grid lines and labels */}
                      {yLabels.map((val, idx) => {
                        const yRatio = yRange > 0 ? (val - yMin) / yRange : 0.5;
                        const y = (marginTop + plottingHeight) - yRatio * plottingHeight;
                        return (
                          <g key={idx}>
                            <line x1={marginLeft} y1={y} x2={chartWidth - marginRight} y2={y} stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3" />
                            <text x={marginLeft - 8} y={y + 3} textAnchor="end" fontSize="8" fill="#a1a1aa" className="font-semibold select-none">
                              {val}
                            </text>
                          </g>
                        );
                      })}
                      <line x1={marginLeft} y1={marginTop} x2={marginLeft} y2={marginTop + plottingHeight} stroke="#e4e4e7" strokeWidth="1" />
                      
                      {/* Bar Chart Rectangles */}
                      {chartBars.map((bar, idx) => (
                        <g key={idx}>
                          <rect
                            x={bar.x}
                            y={bar.y}
                            width={bar.width}
                            height={bar.height}
                            fill="#27272a"
                            rx="3"
                            className="transition-all duration-150 cursor-pointer hover:fill-zinc-800"
                            onMouseEnter={() => setHoveredPoint(bar)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                          <text
                            x={bar.centerX}
                            y={bar.y - 6}
                            textAnchor="middle"
                            fontSize="8"
                            fill="#18181b"
                            className="font-bold select-none"
                          >
                            {bar.weight}
                          </text>
                          <text
                            x={bar.centerX}
                            y={chartHeight - 10}
                            textAnchor="middle"
                            fontSize="8"
                            fill="#a1a1aa"
                            className="font-semibold select-none"
                          >
                            {bar.date}
                          </text>
                        </g>
                      ))}
                    </svg>

                    {/* Tooltip */}
                    {hoveredPoint && (
                      <div
                        className="absolute bg-zinc-950 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md pointer-events-none transition-all duration-100 -translate-x-1/2 -translate-y-full"
                        style={{
                          left: `${(hoveredPoint.centerX / chartWidth) * 100}%`,
                          top: `${(hoveredPoint.y / chartHeight) * 100 - 5}%`
                        }}
                      >
                        {hoveredPoint.weight} kg ({hoveredPoint.date})
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[150px] flex items-center justify-center border border-dashed border-zinc-200 rounded-lg text-[11px] text-zinc-400">
                    {translations[lang].noWeightData}
                  </div>
                );
              })()}

              {/* Under-graph Analytics Dynamics & Add Entry */}
              <div className="mt-4 border-t border-zinc-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[12px] font-semibold text-zinc-600">
                  {translations[lang].remToGoal.replace("{diff}", remToIdeal)}
                </span>
                
                {/* Input to log weight */}
                {(() => {
                  const parsed = parseFloat(weightInputVal);
                  const isValidWeight = weightInputVal === "" || (!isNaN(parsed) && parsed >= 30 && parsed <= 200);
                  const isSubmitDisabled = weightInputVal === "" || !isValidWeight;
                  return (
                    <div className="flex gap-2 items-center self-end">
                      <input
                        type="number"
                        step="0.1"
                        placeholder={translations[lang].weightInputPlaceholder}
                        value={weightInputVal}
                        onChange={(e) => setWeightInputVal(e.target.value)}
                        className={`w-20 px-2 py-1 border rounded-lg text-xs text-center focus:outline-none focus:ring-1 
                          ${!isValidWeight && weightInputVal !== "" ? "border-red-400 focus:ring-red-400" : "border-zinc-200 focus:ring-zinc-400"}`}
                        id="weightLogInput"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !isSubmitDisabled) {
                            logWeight(weightInputVal);
                            setWeightInputVal("");
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (!isSubmitDisabled) {
                            logWeight(weightInputVal);
                            setWeightInputVal("");
                          }
                        }}
                        disabled={isSubmitDisabled}
                        className="px-3 py-1 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold active:scale-[0.98] transition-all"
                      >
                        {translations[lang].weightLogBtn}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Meal analytics block */}
            {(() => {
              const displayEatenCount = tgUser?.id ? globalAnalytics.eatenCount : eatenMeals.length;
              const displayEatenCalories = tgUser?.id ? globalAnalytics.eatenCalories : eatenCalories;
              const displayMissedCount = tgUser?.id ? globalAnalytics.missedCount : missedMealsCount;
              const displayMissedCalories = tgUser?.id ? globalAnalytics.missedCalories : lostCalories;
              return (
                <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm p-5 mb-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
                    {lang === "ru" ? "Аналитика приемов пищи" : "Mahlzeiten-Analysen"}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1.5 border-b border-zinc-100">
                      <span className="text-[12px] font-medium text-zinc-500">
                        {lang === "ru" ? "Пройдено приемов пищи" : "Absolvierte Mahlzeiten"}
                      </span>
                      <span className="text-[12px] font-bold text-zinc-800">
                        {displayEatenCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-zinc-100">
                      <span className="text-[12px] font-medium text-zinc-500">
                        {lang === "ru" ? "Съедено" : "Gegessen"}
                      </span>
                      <span className="text-[12px] font-bold text-zinc-800 font-mono">
                        {lang === "ru" ? `${displayEatenCalories} ккал` : `${displayEatenCalories} kcal`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-zinc-100">
                      <span className="text-[12px] font-medium text-zinc-500">
                        {lang === "ru" ? "Пропущено приемов пищи" : "Verpasste Mahlzeiten"}
                      </span>
                      <span className="text-[12px] font-bold text-zinc-800">
                        {displayMissedCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-[12px] font-medium text-zinc-500">
                        {lang === "ru" ? "Утрачено" : "Verloren"}
                      </span>
                      <span className="text-[12px] font-bold text-red-500 font-mono">
                        {lang === "ru" ? `${displayMissedCalories} ккал` : `${displayMissedCalories} kcal`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {activeTab === "profile" && (
          <>
            {/* Subscription Status Card */}
            {profile && (
              profile.subscriptionStatus === "premium" ? (
                <div className="bg-zinc-950 text-white rounded-xl border border-zinc-800 p-5 mb-5 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {lang === "ru" ? "ПОДПИСКА" : "ABO"}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white text-zinc-950">Premium</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                    {lang === "ru" 
                      ? `Премиум активен до: ${new Date(profile.subscriptionExpiresAt).toLocaleDateString("ru-RU")}`
                      : `Premium aktiv bis: ${new Date(profile.subscriptionExpiresAt).toLocaleDateString("de-DE")}`}
                  </p>
                </div>
              ) : (
                <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-5 mb-5 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {lang === "ru" ? "ПОДПИСКА" : "ABO"}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-200 text-zinc-600">Free</span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-4 leading-relaxed font-medium">
                    {lang === "ru" 
                      ? "Получите доступ к расширенному ИИ-анализу и готовым заменам." 
                      : "Erhalten Sie Zugriff auf erweiterte KI-Analysen und Fertiggerichte."}
                  </p>
                  <button
                    onClick={handleSubscribe}
                    disabled={isSubscribing}
                    className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubscribing 
                      ? (lang === "ru" ? "Активация..." : "Aktiviere...") 
                      : (lang === "ru" ? "Активировать Premium" : "Premium aktivieren")}
                  </button>
                </div>
              )
            )}

            {/* AI Dietitian Analysis Summary Card */}
            {profile?.aiAnalysisText && (
              <div className="bg-zinc-50 border border-zinc-200 p-5 mb-5 rounded-xl shadow-sm relative overflow-hidden">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  {translations[lang].aiAnalysisTitle}
                </h4>
                <p className="text-[13px] text-zinc-600 leading-relaxed font-medium">
                  {profile.aiAnalysisText}
                </p>
              </div>
            )}

            {/* Profile Editing Form */}
            <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm p-5 mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                {lang === "ru" ? "Данные профиля" : "Profil-Daten"}
              </h3>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                {/* Gender Select */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-zinc-600">{translations[lang].genderLabel}</span>
                  <div className="flex bg-zinc-100 p-0.5 rounded-lg w-[100px] h-[28px] border border-zinc-200/40 relative">
                    <div
                      className="absolute top-0.5 bottom-0.5 rounded-[6px] bg-white shadow-sm transition-all duration-300 ease-out"
                      style={{
                        left: editProfileForm.gender === "M" ? "2px" : "50px",
                        width: "48px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setEditProfileForm(prev => ({ ...prev, gender: "M" }))}
                      className={`relative z-10 w-1/2 text-[11px] font-bold transition-colors duration-200 ${
                        editProfileForm.gender === "M" ? "text-zinc-800" : "text-zinc-400"
                      }`}
                    >
                      {translations[lang].genderM}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditProfileForm(prev => ({ ...prev, gender: "F" }))}
                      className={`relative z-10 w-1/2 text-[11px] font-bold transition-colors duration-200 ${
                        editProfileForm.gender === "F" ? "text-zinc-800" : "text-zinc-400"
                      }`}
                    >
                      {translations[lang].genderF}
                    </button>
                  </div>
                </div>

                {/* Age Input */}
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-zinc-600">{translations[lang].ageLabel}</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={editProfileForm.age}
                    onChange={(e) => setEditProfileForm(prev => ({ ...prev, age: e.target.value }))}
                    className="w-20 px-2 py-1 border border-zinc-200 rounded-lg text-sm bg-zinc-50 font-medium text-right text-zinc-800 focus:outline-none"
                  />
                </div>

                {/* Height Input */}
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-zinc-600">{translations[lang].heightLabel}</label>
                  <input
                    type="number"
                    min="50"
                    max="250"
                    required
                    value={editProfileForm.height}
                    onChange={(e) => setEditProfileForm(prev => ({ ...prev, height: e.target.value }))}
                    className="w-20 px-2 py-1 border border-zinc-200 rounded-lg text-sm bg-zinc-50 font-medium text-right text-zinc-800 focus:outline-none"
                  />
                </div>

                {/* Weight Input */}
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-zinc-600">{translations[lang].weightLabel}</label>
                  <input
                    type="number"
                    min="20"
                    max="300"
                    required
                    value={editProfileForm.weight}
                    onChange={(e) => setEditProfileForm(prev => ({ ...prev, weight: e.target.value }))}
                    className="w-20 px-2 py-1 border border-zinc-200 rounded-lg text-sm bg-zinc-50 font-medium text-right text-zinc-800 focus:outline-none"
                  />
                </div>

                {/* Activity Level Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-medium text-zinc-600">{translations[lang].activityLabel}</label>
                  <select
                    value={editProfileForm.activity}
                    onChange={(e) => setEditProfileForm(prev => ({ ...prev, activity: e.target.value }))}
                    className="w-full px-2 py-1.5 border border-zinc-200 rounded-lg text-sm bg-zinc-50 font-medium text-zinc-800"
                  >
                    <option value="1.2">{translations[lang].activity1}</option>
                    <option value="1.5">{translations[lang].activity2}</option>
                    <option value="1.8">{translations[lang].activity3}</option>
                  </select>
                </div>

                {/* Goal Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-medium text-zinc-600">{translations[lang].goalLabel}</label>
                  <select
                    value={editProfileForm.goal}
                    onChange={(e) => setEditProfileForm(prev => ({ ...prev, goal: e.target.value }))}
                    className="w-full px-2 py-1.5 border border-zinc-200 rounded-lg text-sm bg-zinc-50 font-medium text-zinc-800"
                  >
                    <option value="gain">{translations[lang].goalGain}</option>
                    <option value="maintain">{translations[lang].goalMaintain}</option>
                    <option value="lose">{translations[lang].goalLose}</option>
                  </select>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition-all active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                >
                  {isSavingProfile && (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>{lang === "ru" ? "Сохранить изменения" : "Änderungen speichern"}</span>
                </button>
              </form>
            </div>

            {/* Collapsible Daytime Schedule Settings Card */}
            <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm mb-5 overflow-hidden">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-50/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-zinc-700">
                    {translations[lang].settingsTitle}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${showSettings ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showSettings && (
                <div className="px-4 pb-4 border-t border-zinc-100 pt-4 space-y-4">
                  {/* Wake up input */}
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium text-zinc-600">
                      {translations[lang].wakeLabel}
                    </label>
                    <input
                      type="time"
                      value={schedule.wakeTime}
                      onChange={(e) => setSchedule(prev => ({ ...prev, wakeTime: e.target.value }))}
                      className="px-2 py-1 border border-zinc-200 rounded-lg text-sm bg-zinc-50 font-medium text-zinc-800 focus:outline-none"
                    />
                  </div>

                  {/* Bed time input */}
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium text-zinc-600">
                      {translations[lang].bedLabel}
                    </label>
                    <input
                      type="time"
                      value={schedule.bedTime}
                      onChange={(e) => setSchedule(prev => ({ ...prev, bedTime: e.target.value }))}
                      className="px-2 py-1 border border-zinc-200 rounded-lg text-sm bg-zinc-50 font-medium text-zinc-800 focus:outline-none"
                    />
                  </div>

                  {/* Enable Notifications checkbox */}
                  <label className="flex items-center gap-3 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedule.notifications}
                      onChange={(e) => setSchedule(prev => ({ ...prev, notifications: e.target.checked }))}
                      className="checkbox-custom"
                    />
                    <span className="text-[13px] font-medium text-zinc-600 select-none">
                      {translations[lang].notifyLabel}
                    </span>
                  </label>

                  {/* 1h Reminder checkbox */}
                  <label className={`flex items-center gap-3 py-1 cursor-pointer transition-opacity duration-200 ${schedule.notifications ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                    <input
                      type="checkbox"
                      checked={schedule.remind1h}
                      disabled={!schedule.notifications}
                      onChange={(e) => setSchedule(prev => ({ ...prev, remind1h: e.target.checked }))}
                      className="checkbox-custom"
                    />
                    <span className="text-[13px] font-medium text-zinc-600 select-none">
                      {translations[lang].remindLabel}
                    </span>

                  </label>
                
                <div className="pt-4 mt-4 border-t border-zinc-100 flex justify-center">
                  <button
                    onClick={handleResetAccount}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors py-2 px-4 border border-red-200 rounded-xl bg-red-50 hover:bg-red-100 w-full"
                  >
                    {translations[lang].resetAccount}
                  </button>
                </div>
                </div>
              )}

            </div>

            {/* Release notes changelog card */}
            {changelog && changelog.points && (
              <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-4 text-left shadow-sm">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  Что нового в v{changelog.version}
                </h4>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-500 font-medium">
                  {changelog.points.map((pt, idx) => (
                    <li key={idx} className="leading-relaxed">{pt}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-zinc-900 mb-2">
              {lang === "ru" ? "История" : "History"}
            </h3>
            
            <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm p-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
                {lang === "ru" ? "История веса" : "Weight History"}
              </h4>
              {weightHistory.length > 0 ? (
                <div className="space-y-2">
                  {[...weightHistory].reverse().map((w, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0">
                      <span className="text-sm font-semibold text-zinc-800">{w.date}</span>
                      <span className="text-sm font-bold text-indigo-600">{w.weight} kg</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  {lang === "ru" ? "Нет данных" : "No data"}
                </p>
              )}
            </div>

            <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm p-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
                {lang === "ru" ? "Съеденные приемы (сегодня)" : "Eaten meals (today)"}
              </h4>
              {eatenMeals.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {eatenMeals.map((m, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-bold capitalize border border-green-200">
                      {m}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  {lang === "ru" ? "Пока ничего не съедено" : "Nothing eaten yet"}
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Light Layered Dock */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 flex items-end pointer-events-none"
        style={{
          height: "90px",
          paddingBottom: "env(safe-area-inset-bottom)"
        }}
      >
        <div className="w-full h-[70px] max-w-lg mx-auto bg-white border-t border-zinc-200 grid grid-cols-5 items-center justify-items-center pointer-events-auto shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          
          <button
            onClick={() => setActiveTab("timeline")}
            className="w-full h-full flex justify-center items-center cursor-pointer transition-colors duration-200"
            style={{ color: activeTab === "timeline" ? "#000000" : "#A1A1AA" }}
          >
            <Utensils className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className="w-full h-full flex justify-center items-center cursor-pointer transition-colors duration-200"
            style={{ color: activeTab === "analytics" ? "#000000" : "#A1A1AA" }}
          >
            <LineChart className="w-6 h-6" />
          </button>

          <div className="w-full h-full flex justify-center items-center">
            <button
              onClick={() => setIsChatOpen(true)}
              className="w-16 h-10 flex-shrink-0 rounded-full border border-black/5 bg-gradient-to-b from-white to-[#F2F2F7] text-black flex justify-center items-center cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.95] shadow-[0_2px_10px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,1),inset_0_-1px_2px_rgba(0,0,0,0.04)]"
            >
              <MessageCircle className="w-[22px] h-[22px] opacity-80" />
            </button>
          </div>

          <button
            onClick={() => setActiveTab("history")}
            className="w-full h-full flex justify-center items-center cursor-pointer transition-colors duration-200"
            style={{ color: activeTab === "history" ? "#000000" : "#A1A1AA" }}
          >
            <Calendar className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className="w-full h-full flex justify-center items-center cursor-pointer transition-colors duration-200"
            style={{ color: activeTab === "profile" ? "#000000" : "#A1A1AA" }}
          >
            <User className="w-6 h-6" />
          </button>

        </div>
      </div>

      {/* AI Chat BottomSheet */}
      <AIChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        userId={userId} 
        lang={lang} 
        messages={chatMessages}
        setMessages={setChatMessages}
        onFoodLogged={handleFoodLogged}
      />
    </div>
  );
}
