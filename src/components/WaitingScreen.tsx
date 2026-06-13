/**
 * КОМПОНЕНТ ОЖИДАНИЯ
 * 
 * Показывается, когда один участник уже прошёл тест,
 * а второй ещё нет. Результат можно увидеть только
 * когда ОБА завершили тест.
 * 
 * На этом экране:
 * - Анимация ожидания
 * - Кнопки для повторного приглашения партнёра
 * - Кнопка "Проверить" (имитация проверки)
 */

import React, { useState } from 'react';

interface WaitingScreenProps {
  sessionId: string;            // ID сессии для формирования ссылки
  onCheck: () => void;          // Функция проверки статуса партнёра
  isPlayer1Done: boolean;       // Завершил ли первый участник
  isPlayer2Done: boolean;       // Завершил ли второй участник
}

const WaitingScreen: React.FC<WaitingScreenProps> = ({ 
  sessionId, 
  onCheck,
  isPlayer1Done,
  isPlayer2Done 
}) => {
  // Состояние кнопки копирования
  const [copied, setCopied] = useState(false);

  // Ссылка для партнёра
  const shareUrl = `${window.location.origin}${window.location.pathname}?session=${sessionId}&player=2`;

  // Функция копирования ссылки
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Фоллбэк для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md mx-auto w-full text-center animate-fadeInUp">
        
        {/* Анимированный эмодзи */}
        <div className="text-6xl mb-6 animate-pulse-soft">⏳</div>
        
        {/* Заголовок */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Ждём второго участника
        </h2>
        
        {/* Описание */}
        <p className="text-gray-500 mb-6">
          Результат появится, когда ваш партнёр тоже пройдёт тест. 
          Отправьте ему ссылку, если ещё не сделали!
        </p>
        
        {/* Статус участников */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Участник 1</span>
            <span className={`text-sm font-semibold ${isPlayer1Done ? 'text-green-500' : 'text-gray-400'}`}>
              {isPlayer1Done ? '✅ Готово' : '⏳ Ожидание'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Участник 2</span>
            <span className={`text-sm font-semibold ${isPlayer2Done ? 'text-green-500' : 'text-gray-400'}`}>
              {isPlayer2Done ? '✅ Готово' : '⏳ Ожидание'}
            </span>
          </div>
        </div>
        
        {/* Кнопки действий */}
        <div className="space-y-3">
          {/* Кнопка проверки */}
          <button 
            onClick={onCheck}
            className="btn-primary"
          >
            🔄 Проверить
          </button>
          
          {/* Кнопка копирования ссылки */}
          <button 
            onClick={handleCopy}
            className="btn-secondary"
          >
            {copied ? '✅ Ссылка скопирована!' : '🔗 Скопировать ссылку для партнёра'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingScreen;
