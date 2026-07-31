import React, { useState } from "react";
import { Gift, Copy, Check, Users, Sparkles, Share2 } from "lucide-react";

export default function ReferralCard({ userId, lang = "ru", points = 0, referralStats, onRedeemSuccess }) {
  const [copied, setCopied] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [internalStats, setInternalStats] = useState(null);

  const isRu = lang === "ru";
  const refLink = `https://t.me/TrackerCPFC_bot?start=ref_${userId}`;

  React.useEffect(() => {
    if (!userId) return;
    fetch(`/api/referral/stats?userId=${userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setInternalStats(data);
      })
      .catch(() => {});
  }, [userId, points]);

  const activeStats = referralStats || internalStats;
  const currentPoints = activeStats?.points !== undefined ? activeStats.points : points;
  const totalInvited = activeStats?.total_invited || 0;
  const totalConverted = activeStats?.total_converted || 0;
  const invitedUsers = activeStats?.invited_users || [];
  const invitedBy = activeStats?.invited_by;
  const progressPercent = Math.min(100, Math.round((currentPoints / 500) * 100));

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const refParam = `ref_${userId}`;
    const appLink = `https://t.me/TrackerCPFC_bot?start=${refParam}`;
    const shareText = encodeURIComponent('Набирай массу вместе со мной в GainTracker! 💪');
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(appLink)}&text=${shareText}`;
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, "_blank");
    }
  };

  const handleRedeem = async () => {
    if (currentPoints < 500 || isRedeeming) return;
    setIsRedeeming(true);
    try {
      const res = await fetch("/api/referral/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (onRedeemSuccess) onRedeemSuccess(data.newExpiry);
        alert(isRu ? "🎉 Поздравляем! 1 месяц Premium активирован!" : "🎉 Glückwunsch! 1 Monat Premium aktiviert!");
      } else {
        alert(data.error || (isRu ? "Ошибка обмена" : "Fehler"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 mb-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-zinc-950 tracking-tight">
              {isRu ? "Реферальная программа" : "Empfehlungsprogramm"}
            </h3>
            <p className="text-[11px] text-zinc-500">
              {isRu ? "Приглашай друзей — получай Premium" : "Freunde einladen — Premium erhalten"}
            </p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs font-black text-amber-700">{currentPoints} <span className="text-[10px] font-semibold text-amber-600">баллов</span></span>
        </div>
      </div>

      {/* Inviter Info Banner if invited_by exists */}
      {invitedBy && (
        <div className="bg-amber-50/80 border border-amber-200/70 rounded-xl p-3 flex items-start space-x-2.5">
          <Gift className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-amber-900 leading-snug">
            {isRu
              ? "Ты пришёл по приглашению друга. Когда купишь Premium — он получит +200 баллов 🎁"
              : "Du bist über die Einladung eines Freundes gekommen. При покупке Premium — er bekommt +200 Punkte 🎁"}
          </p>
        </div>
      )}

      {/* Progress Bar to 500 pts */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-[11px] font-semibold text-zinc-600">
          <span>{isRu ? "Прогресс до 1 мес Premium" : "Fortschritt zu 1 Monat Premium"}</span>
          <span>{currentPoints} / 500 {isRu ? "баллов" : "Pkt"}</span>
        </div>
        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-amber-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 flex items-center space-x-3">
          <Users className="w-4 h-4 text-zinc-400" />
          <div>
            <span className="block text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
              {isRu ? "Приглашено" : "Eingeladen"}
            </span>
            <span className="text-sm font-bold text-zinc-900">{totalInvited}</span>
          </div>
        </div>
        <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 flex items-center space-x-3">
          <Gift className="w-4 h-4 text-emerald-500" />
          <div>
            <span className="block text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
              {isRu ? "Оформили Premium" : "Premium gekauft"}
            </span>
            <span className="text-sm font-bold text-zinc-900">{totalConverted}</span>
          </div>
        </div>
      </div>

      {/* Referral Link & Actions */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          {isRu ? "Твоя реферальная ссылка" : "Dein Empfehlungslink"}
        </label>
        <input
          type="text"
          readOnly
          value={refLink}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium text-zinc-700 truncate focus:outline-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopy}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 active:scale-95 border ${
              copied
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isRu ? "Скопировано" : "Kopiert"}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{isRu ? "Скопировать" : "Kopieren"}</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="py-2 px-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 active:scale-95 shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isRu ? "Поделиться" : "Teilen"}</span>
          </button>
        </div>
      </div>

      {/* Invited Users List */}
      <div className="space-y-2 pt-1 border-t border-zinc-100">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          {isRu ? "Приглашённые" : "Eingeladene Kontakte"}
        </label>

        {invitedUsers.length === 0 ? (
          <p className="text-xs text-zinc-400 italic text-center py-2">
            {isRu ? "Ты ещё никого не пригласил" : "Du hast noch niemanden eingeladen"}
          </p>
        ) : (
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {invitedUsers.map((item, idx) => (
              <div
                key={item.invitee_id || idx}
                className="flex items-center justify-between p-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-xs"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-[10px]">
                    ID
                  </div>
                  <div>
                    <span className="block font-semibold text-zinc-900">
                      ID: {item.invitee_id}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString(isRu ? "ru-RU" : "de-DE") : ""}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.converted
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      : "bg-zinc-200/60 text-zinc-600"
                  }`}
                >
                  {item.converted
                    ? (isRu ? "✅ Купил Premium" : "✅ Premium gekauft")
                    : (isRu ? "⏳ Зарегистрировался" : "⏳ Registriert")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Redeem Button */}
      <button
        onClick={handleRedeem}
        disabled={currentPoints < 500 || isRedeeming}
        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 active:scale-[0.98] ${
          currentPoints >= 500
            ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
            : "bg-zinc-100 text-zinc-400 border border-zinc-200/60 cursor-not-allowed"
        }`}
      >
        <span>
          {isRedeeming
            ? (isRu ? "Активация..." : "Aktiviere...")
            : (isRu ? "Получить 1 месяц Premium бесплатно (500 баллов)" : "1 Monat Premium einlösen (500 Pkt)")}
        </span>
      </button>

      {/* Rewards info footer */}
      <div className="text-[10px] text-zinc-400 text-center leading-relaxed">
        {isRu
          ? "+50 баллов за регистрацию друга • +200 баллов при подписке на Premium"
          : "+50 Punkte für Registrierung • +200 Punkte bei Premium-Kauf"}
      </div>
    </div>
  );
}
