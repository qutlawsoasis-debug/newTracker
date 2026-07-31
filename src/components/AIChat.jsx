import React, { useState, useRef, useEffect } from 'react';

const AIChat = ({ isOpen, onClose, userId, lang, messages, setMessages, onFoodLogged, isPremium = false, onUpgradeClick }) => {
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [chatCount, setChatCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);

  useEffect(() => {
    if (!isOpen || isPremium || !userId) return;
    fetch(`/api/npc/chat-limit?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        setChatCount(data.count || 0);
        setIsLimitReached(data.limitReached || false);
      })
      .catch(() => {});
  }, [isOpen, isPremium, userId]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        sender: "npc",
        text: lang === "ru" 
          ? "Привет, я твой ИИ-наставник по питанию. Напиши, что ты съел, или отправь фото еды/чека!" 
          : "Hi, I'm your AI nutrition coach. Tell me what you ate or send a photo of your food/receipt!"
      }]);
    }
    scrollToBottom();
  }, [messages, isOpen, lang, setMessages]);

  const compressImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSendMessage = async (text, imageBase64 = null) => {
    const messageText = text.trim();
    if (!messageText && !imageBase64) return;

    if (isLimitReached) {
      if (onUpgradeClick) {
        onUpgradeClick(lang === "ru" ? "⭐ Лимит 3 сообщения в день. Upgrade до Premium для безлимитного AI чата" : "⭐ Limit 3 Nachrichten/Tag. Upgrade auf Premium für den unbegrenzten KI-Chat");
      }
      return;
    }
    
    // Optimistic UI update
    const newMsg = { sender: "user", text: messageText, image: imageBase64 };
    setMessages(prev => [...prev, newMsg]);
    setInputValue("");
    setIsSending(true);

    try {
      const res = await fetch('/api/npc/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: messageText,
          image: imageBase64,
          history: messages
        })
      });

      if (!res.ok) {
        let errStr = "Chat request failed";
        try {
          const errData = await res.json();
          if (errData.error === "FREE_LIMIT") {
            setIsLimitReached(true);
            if (onUpgradeClick) {
              onUpgradeClick(lang === "ru" ? "⭐ Лимит 3 сообщения в день. Upgrade до Premium для безлимитного AI чата" : "⭐ Limit 3 Nachrichten/Tag. Upgrade auf Premium für den unbegrenzten KI-Chat");
            }
          }
          if (errData.error) errStr = errData.error;
        } catch(e) {}
        throw new Error(errStr);
      }

      const data = await res.json();
      
      setMessages(prev => [...prev, { sender: "npc", text: data.text }]);
      
      if (!isPremium) {
        setChatCount(prev => {
          const next = prev + 1;
          if (next >= 3) setIsLimitReached(true);
          return next;
        });
      }

      if (data.food_log) {
        onFoodLogged(data.food_log);
      }
    } catch (err) {
      console.error("Chat error:", err);
      if (messageText) setInputValue(messageText);
      setMessages(prev => [...prev, { 
        sender: "npc", 
        text: `Ошибка API: ${err.message || "Неизвестная ошибка"}` 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLimitReached) {
      if (onUpgradeClick) {
        onUpgradeClick(lang === "ru" ? "⭐ Лимит 3 сообщения в день. Upgrade до Premium для безлимитного AI чата" : "⭐ Limit 3 Nachrichten/Tag. Upgrade auf Premium für unbegrenzten KI-Chat");
      }
      return;
    }
    handleSendMessage(inputValue);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isLimitReached) {
      if (onUpgradeClick) {
        onUpgradeClick(lang === "ru" ? "⭐ Лимит 3 сообщения в день. Upgrade до Premium для безлимитного AI чата" : "⭐ Limit 3 Nachrichten/Tag. Upgrade auf Premium для unbegrenzten KI-Chat");
      }
      return;
    }

    try {
      const base64 = await compressImageToBase64(file);
      handleSendMessage(lang === "ru" ? "Анализирую изображение..." : "Analyzing image...", base64);
    } catch (err) {
      console.error("Image compression error:", err);
    }
  };

  const handleTriggerCamera = () => {
    if (isLimitReached) {
      if (onUpgradeClick) {
        onUpgradeClick(lang === "ru" ? "⭐ Лимит 3 сообщения в день. Upgrade до Premium для безлимитного AI чата" : "⭐ Limit 3 Nachrichten/Tag. Upgrade на Premium для безлимитного AI чата");
      }
      return;
    }
    document.getElementById('cameraInput')?.click();
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-lg mx-auto h-[85vh] bg-[#F5F5F7] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 px-5 py-4 bg-white border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-lg">
              ✨
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 leading-snug">
                {lang === "ru" ? "ИИ-Наставник по питанию" : "AI Nutrition Coach"}
              </h3>
              <p className="text-xs text-zinc-400">
                {isPremium
                  ? (lang === "ru" ? "⭐ Premium активен (безлимит)" : "⭐ Premium active (unlimited)")
                  : (lang === "ru" ? `Использовано ${currentChatCount}/3 сообщений` : `Used ${currentChatCount}/3 messages`)}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div 
                className={`max-w-[82%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                  msg.sender === "user" 
                    ? "bg-indigo-600 text-white rounded-br-none" 
                    : "bg-white text-zinc-800 border border-zinc-200/80 rounded-bl-none"
                }`}
              >
                {msg.image && (
                  <img 
                    src={msg.image} 
                    alt="Uploaded" 
                    className="max-w-full rounded-lg mb-2 max-h-48 object-cover border border-white/20" 
                  />
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex items-start">
              <div className="bg-white text-zinc-500 border border-zinc-200/80 px-4 py-3 rounded-2xl rounded-bl-none text-xs flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                {lang === "ru" ? "ИИ размышляет над ответом..." : "AI is thinking..."}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar or Limit Banner */}
        {isLimitReached ? (
          <div className="shrink-0 p-4 bg-amber-50 border-t border-amber-200 text-center space-y-2.5">
            <p className="text-xs font-semibold text-amber-900 leading-snug">
              ⭐ Лимит 3 сообщения в день. Upgrade до Premium для безлимитного AI чата
            </p>
            <button
              onClick={() => onUpgradeClick && onUpgradeClick(lang === "ru" ? "⭐ Лимит 3 сообщения в день. Upgrade до Premium для безлимитного AI чата" : "⭐ Limit 3 Nachrichten/Tag. Upgrade auf Premium für unbegrenzten KI-Chat")}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-sm transition-all active:scale-[0.98]"
            >
              Купить Premium — 150 Stars
            </button>
          </div>
        ) : (
          <div className="shrink-0 p-3 bg-white border-t border-zinc-100">
            <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-lg mx-auto">
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/jpg" 
                capture="environment" 
                style={{display: 'none'}} 
                id="cameraInput" 
                onChange={handleFileChange} 
              />
              
              <button
                type="button"
                onClick={handleTriggerCamera}
                className="p-2.5 text-zinc-500 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </button>
              
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={lang === "ru" ? "Напиши или сфоткай еду..." : "Type or snap food..."}
                className="flex-1 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-zinc-400 transition-all shadow-sm"
                disabled={isSending}
              />
              
              <button
                type="submit"
                disabled={!inputValue.trim() || isSending}
                className="p-2.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-40 disabled:hover:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl transition-colors font-bold shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChat;
