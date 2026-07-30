import React, { useState, useRef, useEffect } from 'react';

const AIChat = ({ isOpen, onClose, userId, lang, messages, setMessages, onFoodLogged }) => {
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

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

  // Removed early return to allow CSS exit animations

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
    if (!text.trim() && !imageBase64) return;
    
    // Optimistic UI update
    const newMsg = { sender: "user", text: text.trim(), image: imageBase64 };
    setMessages(prev => [...prev, newMsg]);
    setInputValue("");
    setIsSending(true);

    try {
      const res = await fetch('/api/npc/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: text.trim(),
          image: imageBase64,
          history: messages
        })
      });

      if (!res.ok) {
        let errStr = "Chat request failed";
        try {
          const errData = await res.json();
          if (errData.error) errStr = errData.error;
        } catch(e) {}
        throw new Error(errStr);
      }

      const data = await res.json();
      
      setMessages(prev => [...prev, { sender: "npc", text: data.text }]);
      
      if (data.food_log) {
        onFoodLogged(data.food_log);
      }
    } catch (err) {
      console.error("Chat error:", err);
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
    handleSendMessage(inputValue);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await compressImageToBase64(file);
      handleSendMessage("", base64);
    } catch (err) {
      console.error("Error reading file:", err);
    } finally {
      if (e.target) e.target.value = ""; // Reset input
    }
  };

  const handleTriggerCamera = () => {
    document.getElementById('cameraInput')?.click();
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col justify-end transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto bg-black/60" : "opacity-0 pointer-events-none bg-transparent"
      }`}
    >
      <div 
        className={`w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col transition-transform duration-300 will-change-transform`}
        style={{ 
          height: "90vh", 
          transitionTimingFunction: "cubic-bezier(0.25, 1, 0.3, 1)",
          transform: isOpen ? "translateY(0)" : "translateY(100%)"
        }}
      >
        {/* Header / Draggable Handle Area */}
        <div className="relative w-full h-12 flex items-center justify-center shrink-0 border-b border-zinc-100">
          <div className="absolute top-2 w-10 h-1 bg-zinc-300 rounded-full" />
          <h3 className="text-zinc-800 font-semibold text-[15px] mt-1">
            {lang === "ru" ? "ИИ-Тренер" : "AI Coach"}
          </h3>
          <button 
            onClick={onClose}
            className="absolute right-4 text-zinc-400 hover:text-zinc-600 p-1 rounded-full bg-zinc-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[14px] scroll-smooth bg-zinc-50/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-br-sm shadow-sm'
                    : 'bg-[#e5e7eb] text-zinc-900 rounded-bl-sm shadow-sm'
                }`}
              >
                {msg.image && (
                  <img src={msg.image} alt="User upload" className="w-full rounded-lg mb-2 object-cover max-h-48" />
                )}
                {msg.text && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
              </div>
            </div>
          ))}
          
          {isSending && (
            <div className="flex justify-start">
              <div className="bg-[#e5e7eb] text-zinc-500 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Input Bar */}
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
      </div>
    </div>
  );
};

export default AIChat;
