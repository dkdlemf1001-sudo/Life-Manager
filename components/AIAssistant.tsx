import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '안녕하세요! 당신의 라이프 매니저 모카입니다. 🍓 일정, 투자, 차량 관리 등 무엇이든 물어보세요.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const apiKey = process.env.API_KEY || '';
      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'model', text: '오류: 환경 변수에 API_KEY가 설정되지 않았습니다.' }]);
        setLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
        당신은 사용자의 삶을 돕는 지능적이고 공감 능력 있는 AI 비서인 '라이프 매니저'입니다. (애칭은 모카)
        이 앱에는 차량 관리, 투자 관리, 건강 관리, 목표 관리 모듈이 포함되어 있습니다.
        
        당신의 태도:
        - 아이돌 '아일릿 모카' 처럼 상큼하고 귀여운 말투 사용 (이모지 적극 사용 🍓🍰✨)
        - 스마트폰 화면에서도 읽기 편하도록 간결한 답변
        - 긍정적이고 격려하는 태도
        
        주요 능력:
        1. 차량 관련 질문 시: 일반적인 정비 주기를 알려주고 안전 운전을 당부하세요.
        2. 금융 관련 질문 시: 건전한 투자 원칙을 안내하되, 전문가의 조언도 필요함을 언급하세요.
        3. 목표 관련 질문 시: 응원하고 격려해주세요!
        
        답변은 항상 한국어로 작성하세요.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
            ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
            { role: 'user', parts: [{ text: userMsg }]}
        ],
        config: {
          systemInstruction,
        }
      });

      const text = response.text || "죄송합니다. 답변을 생성할 수 없습니다.";
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: '죄송합니다. 현재 AI 서버와 연결할 수 없습니다.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-140px)] max-w-4xl mx-auto bg-black/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur text-center relative">
        <h2 className="font-bold flex items-center justify-center gap-2 text-pink-300">
           <Sparkles className="w-5 h-5" /> AI 라이프 비서 (Moka)
        </h2>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 group">
            <AlertCircle className="w-5 h-5 text-white/40 cursor-help" />
            <div className="absolute right-0 top-full mt-2 w-48 bg-black/80 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                개인 정보를 입력하지 마세요.
            </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-lg border border-white/10 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-pink-500'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600/80 text-white rounded-tr-none backdrop-blur-md border border-indigo-500/30' 
                  : 'bg-white/10 text-white rounded-tl-none border border-white/10 backdrop-blur-md'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="flex gap-2 bg-white/5 p-4 rounded-2xl rounded-tl-none items-center shadow-sm border border-white/10 ml-12 backdrop-blur-md">
                <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                <span className="text-sm text-white/50">생각하는 중...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/20 border-t border-white/10">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="AI에게 물어보세요..."
            className="flex-1 bg-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-white transition-all pl-6 pr-14 border border-white/10 placeholder:text-white/30"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1.5 bottom-1.5 bg-pink-500 hover:bg-pink-600 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-full w-10 h-10 flex items-center justify-center transition-all shadow-lg"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};