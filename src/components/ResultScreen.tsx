/**
 * КОМПОНЕНТ ЭКРАНА РЕЗУЛЬТАТА
 * 
 * Показывается, когда ОБА участника завершили тест.
 * Отображает:
 * - Процент совпадения (крупно, с анимацией)
 * - Название уровня ("Повелители холодильника" и т.д.)
 * - Описание уровня с упоминанием ФриджФренд
 * - Кнопку "Поделиться результатом" (ведёт на экран выбора: соцсети или картинка)
 * - Кнопку "Попробовать ФриджФренд бесплатно"
 */

import React, { useState, useEffect } from 'react';
import { getResultLevel } from '../data/questions';

interface ResultScreenProps {
  matchPercent: number;            // Процент совпадения
  onShare: () => void;             // Открыть экран шеринга (соцсети + сохранить картинку)
  onGetChecklist: () => void;      // Перейти к форме сбора контактов
}

const ResultScreen: React.FC<ResultScreenProps> = ({ 
  matchPercent, 
  onShare, 
  onGetChecklist 
}) => {
  // Получаем уровень на основе процента (название, описание, цвет, эмодзи)
  const level = getResultLevel(matchPercent);
  
  // Анимация счётчика процентов (от 0 до реального значения)
  const [displayPercent, setDisplayPercent] = useState(0);

  /**
   * АНИМАЦИЯ СЧЁТЧИКА
   * 
   * При появлении экрана число плавно растёт от 0 до реального процента.
   * Это создаёт эффект "подсчёта" и выглядит эффектно.
   */
  useEffect(() => {
    let start = 0;
    const end = matchPercent;
    const duration = 1500; // Длительность анимации в миллисекундах
    const stepTime = duration / end; // Время на одну единицу процента
    
    // Если процент = 0, не анимируем
    if (end === 0) {
      setDisplayPercent(0);
      return;
    }
    
    const timer = setInterval(() => {
      start += 1;
      setDisplayPercent(start);
      
      if (start >= end) {
        clearInterval(timer);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [matchPercent]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md mx-auto w-full">
        
        {/* === КАРТОЧКА РЕЗУЛЬТАТА === */}
        <div className="share-card mb-8 animate-scaleIn">
          
          {/* Эмодзи уровня */}
          <div className="text-5xl mb-4 relative z-10">
            {level.emoji}
          </div>
          
          {/* Процент — крупно и ярко */}
          <div 
            className="text-7xl font-extrabold mb-2 animate-countUp relative z-10"
            style={{ color: level.color }}
          >
            {displayPercent}%
          </div>
          
          {/* Подпись "совпадение" */}
          <p className="text-gray-500 text-sm mb-4 relative z-10">совпадение</p>
          
          {/* Название уровня */}
          <h2 
            className="text-2xl font-bold mb-3 relative z-10"
            style={{ color: level.color }}
          >
            {level.title}
          </h2>
          
          {/* Описание уровня (с упоминанием ФриджФренд) */}
          <p className="text-gray-600 text-sm leading-relaxed relative z-10">
            {level.description}
          </p>
          
          {/* Название теста */}
          <div className="mt-6 pt-4 border-t border-amber-200 relative z-10">
            <p className="text-xs text-gray-400">
              🧊 Тест «Кто съел мой йогурт?»
            </p>
          </div>
        </div>
        
        {/* === КНОПКИ ДЕЙСТВИЙ (всего две) === */}
        <div className="space-y-3 text-center">
          
          {/* ГЛАВНАЯ КНОПКА — призыв попробовать ФриджФренд.
              Стоит первой, крупная, яркая, с тенью — привлекает максимум внимания.
              cursor-pointer — указатель мыши меняется на «руку» при наведении */}
          <button 
            onClick={onGetChecklist}
            className="w-full py-5 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-indigo-600 hover:scale-[1.02] transition-all shadow-xl cursor-pointer"
          >
            📲 Попробовать ФриджФренд бесплатно
          </button>
          
          {/* ВТОРОСТЕПЕННАЯ КНОПКА — "Поделиться результатом".
              Стоит ниже, менее яркая — белый фон, серая рамка.
              cursor-pointer — указатель мыши тоже меняется на «руку» */}
          <button 
            onClick={onShare}
            className="w-full py-3.5 px-6 bg-white text-gray-600 border-2 border-gray-200 rounded-2xl font-medium text-base hover:border-gray-300 hover:text-gray-800 transition-all cursor-pointer"
          >
            📤 Поделиться результатом
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
