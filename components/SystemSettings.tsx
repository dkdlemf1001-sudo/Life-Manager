import React from 'react';
import { Smartphone, Github, Globe, Terminal, Info } from 'lucide-react';

export const SystemSettings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 lg:pb-0 text-gray-800 dark:text-gray-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-2">라이프 매니저 정보</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Version 1.0.0 • React • Tailwind • Gemini AI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 h-full">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-500" />
            모바일 설치 방법
            </h3>
            <ol className="list-decimal list-inside space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            <li className="pl-1">
                <strong>웹 배포:</strong> GitHub Pages나 Vercel 등을 통해 이 사이트를 배포하세요.
            </li>
            <li className="pl-1">
                <strong>브라우저 접속:</strong> 스마트폰에서 Safari(iOS) 또는 Chrome(안드로이드)으로 접속합니다.
            </li>
            <li className="pl-1">
                <strong>홈 화면에 추가:</strong>
                <ul className="list-disc list-inside ml-4 mt-2 text-xs opacity-80 space-y-1">
                <li>iOS: "공유" 버튼 → "홈 화면에 추가"</li>
                <li>안드로이드: 메뉴(점 3개) → "홈 화면에 추가"</li>
                </ul>
            </li>
            <li className="pl-1">
                <strong>실행:</strong> 앱 아이콘이 생성되며 네이티브 앱처럼 전체 화면으로 실행됩니다.
            </li>
            </ol>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 h-full">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Github className="w-5 h-5 text-gray-700 dark:text-white" />
            개발 및 배포 가이드
            </h3>
            
            <div className="space-y-5">
                <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                        <Terminal className="w-4 h-4 text-purple-500" /> 1. 리포지토리 생성
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">GitHub에서 새 리포지토리를 생성합니다.</p>
                </div>

                <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                        <Terminal className="w-4 h-4 text-purple-500" /> 2. 코드 푸시
                    </h4>
                    <div className="bg-slate-900 text-slate-300 p-3 rounded-lg text-xs font-mono overflow-x-auto border border-slate-700">
                        git init<br/>
                        git add .<br/>
                        git commit -m "Initial commit"<br/>
                        git branch -M main<br/>
                        git remote add origin [URL]<br/>
                        git push -u origin main
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-green-500" /> 3. GitHub Pages
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Settings → Pages 메뉴에서 소스를 선택하여 배포합니다.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
