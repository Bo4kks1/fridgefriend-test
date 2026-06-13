/**
 * КОМПОНЕНТ HERO (ПЕРВЫЙ ЭКРАН)
 * 
 * Это первое, что видит пользователь при открытии сайта.
 * Содержит:
 * - Заголовок теста
 * - Подзаголовок с описанием
 * - Кнопку "Начать тест"
 * - Подпись о времени прохождения
 */

import React from 'react';

// Описание свойств компонента (что он принимает извне)
interface HeroScreenProps {
  onStart: () => void; // Функция, которая вызывается при нажатии "Начать тест"
}

const HeroScreen: React.FC<HeroScreenProps> = ({ onStart }) => {
  return (
    /* Контейнер на весь экран с центрированием содержимого */
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      
      {/* Декоративные круги на фоне — создают визуальный эффект */}
      <div className="absolute top-10 left-5 w-32 h-32 bg-amber-200 rounded-full opacity-30 blur-2xl" />
      <div className="absolute bottom-20 right-5 w-40 h-40 bg-red-200 rounded-full opacity-30 blur-2xl" />
      <div className="absolute top-1/3 right-10 w-24 h-24 bg-yellow-300 rounded-full opacity-20 blur-xl" />
      
      {/* Основной контент — появляется с анимацией */}
      <div className="relative z-10 text-center max-w-md mx-auto animate-fadeInUp">
        
        {/* Большой эмодзи — привлекает внимание */}
        <div className="text-7xl mb-6 animate-pulse-soft">
          🧊
        </div>
        
        {/* Главный заголовок */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Кто съел мой{' '}
          {/* Слово "йогурт" выделено градиентом — привлекает внимание */}
          <span className="bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
            йогурт
          </span>
          ?
        </h1>
        
        {/* Подзаголовок — объясняет суть теста */}
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Пройдите тест вдвоём и узнайте, насколько вы синхронизированы 
          в&nbsp;том, что происходит у&nbsp;вас в&nbsp;холодильнике.
        </p>
        
        {/* Кнопка "Начать тест" — главное действие на странице */}
        <button 
          onClick={onStart}
          className="btn-primary text-lg mb-4"
        >
          🚀 Начать тест
        </button>
        
        {/* Подпись о времени — снижает тревогу пользователя */}
        <p className="text-sm text-gray-400 mt-4">
          ⏱ Тест займёт 1–2 минуты
        </p>
      </div>
    </div>
  );
};

export default HeroScreen;
