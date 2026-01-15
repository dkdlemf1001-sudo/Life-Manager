import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '안녕하세요! 당신의 라이프 매니저입니다. 일정, 투자, 차량 관리 등 무엇이든 물어보세요.' }
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
        당신은 사용자의 삶을 돕는 지능적이고 공감 능력 있는 AI 비서인 '라이프 매니저'입니다.
        이 앱에는 차량 관리, 투자 관리, 건강 관리, 목표 관리 모듈이 포함되어 있습니다.
        
        당신의 태도:
        - 전문적이면서도 친근한 어조 (존댓말 사용)
        - 스마트폰 화면에서도 읽기 편하도록 간결한 답변
        - 긍정적이고 격려하는 태도
        
        주요 능력:
        1. 차량 관련 질문 시: 일반적인 정비 주기(엔진오일 1만km, 타이어 5만km 등)나 증상에 대한 조언을 제공하세요.
        2. 금융 관련 질문 시: 건전한 투자 원칙(분산 투자, 적립식 투자)을 안내하되, 재정 자문가는 아님을 명시하세요.
        3. 목표 관련 질문 시: 목표를 달성하기 위한 구체적이고 실행 가능한 작은 단계(SMART 기법 등)를 제안하세요.
        4. 건강 관련 질문 시: 일반적인 건강 상식에 기반하여 조언하세요.
        
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
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-140px)] max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur text-center relative">
        <h2 className="font-bold flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
           <Sparkles className="w-5 h-5" /> AI 라이프 비서
        </h2>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 group">
            <AlertCircle className="w-5 h-5 text-gray-400 cursor-help" />
            <div className="absolute right-0 top-full mt-2 w-48 bg-black/80 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                개인 정보를 입력하지 마세요.
            </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-slate-50 dark:bg-slate-900/50"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-slate-700'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="flex gap-2 bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none items-center shadow-sm border border-gray-100 dark:border-slate-700 ml-12">
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                <span className="text-sm text-gray-500">생각하는 중...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="AI에게 물어보세요..."
            className="flex-1 bg-gray-100 dark:bg-slate-900 rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white transition-all pl-5 pr-12"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1.5 bottom-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-full w-10 h-10 flex items-center justify-center transition-all shadow-md"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
