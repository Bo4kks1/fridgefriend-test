/**
 * КОМПОНЕНТ ТЕСТА (ВОПРОСЫ)
 * 
 * Это главный экран теста. Здесь пользователь:
 * - Видит один вопрос за раз
 * - Выбирает вариант ответа
 * - Видит таймер обратного отсчёта (7 секунд)
 * - Видит прогресс-бар (сколько вопросов осталось)
 * 
 * После выбора ответа автоматически переходит к следующему вопросу.
 * Если время вышло — переходит без ответа (записывается -1).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { questions } from '../data/questions';

interface QuizScreenProps {
  onComplete: (answers: number[]) => void; // Вызывается когда тест завершён
}

// Время на ответ (в секундах)
const TIMER_DURATION = 7;

const QuizScreen: React.FC<QuizScreenProps> = ({ onComplete }) => {
  // === СОСТОЯНИЯ КОМПОНЕНТА ===
  
  // Номер текущего вопроса (начинаем с 0)
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Массив ответов пользователя (номер выбранного варианта для каждого вопроса)
  const [answers, setAnswers] = useState<number[]>([]);
  
  // Оставшееся время на текущий вопрос
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  
  // Выбранный вариант (для визуального выделения перед переходом)
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Флаг: идёт ли сейчас переход к следующему вопросу
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Текущий вопрос из массива
  const question = questions[currentQuestion];
  
  // Общее количество вопросов
  const totalQuestions = questions.length;
  
  // Процент прогресса (для прогресс-бара)
  const progressPercent = ((currentQuestion) / totalQuestions) * 100;

  /**
   * Переход к следующему вопросу
   * useCallback — оптимизация, чтобы функция не пересоздавалась при каждом рендере
   */
  const goToNext = useCallback((answerIndex: number) => {
    // Если уже идёт переход — не делаем ничего (защита от двойного клика)
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Добавляем ответ в массив
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);
    
    // Через 400мс переходим к следующему вопросу (даём время на анимацию)
    setTimeout(() => {
      if (currentQuestion + 1 < totalQuestions) {
        // Если есть ещё вопросы — показываем следующий
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(TIMER_DURATION); // Сбрасываем таймер
        setSelectedOption(null);     // Сбрасываем выбор
        setIsTransitioning(false);
      } else {
        // Если вопросы закончились — завершаем тест
        onComplete(newAnswers);
      }
    }, 400);
  }, [answers, currentQuestion, totalQuestions, onComplete, isTransitioning]);

  /**
   * ТАЙМЕР ОБРАТНОГО ОТСЧЁТА
   * 
   * useEffect запускает код при монтировании компонента и при изменении зависимостей.
   * Каждую секунду уменьшаем timeLeft на 1.
   * Когда время вышло — переходим к следующему вопросу (ответ = -1, т.е. без ответа).
   */
  useEffect(() => {
    // Если идёт переход — не запускаем таймер
    if (isTransitioning) return;
    
    // Если время вышло — переходим дальше
    if (timeLeft <= 0) {
      goToNext(-1); // -1 означает "не ответил"
      return;
    }
    
    // Создаём интервал, который срабатывает каждую секунду
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    // Очистка интервала при размонтировании или изменении зависимостей
    return () => clearInterval(timer);
  }, [timeLeft, isTransitioning, goToNext]);

  /**
   * Обработка выбора варианта ответа
   * Вызывается при клике на вариант
   */
  const handleSelect = (optionIndex: number) => {
    if (isTransitioning) return; // Защита от двойного клика
    
    setSelectedOption(optionIndex);  // Визуально выделяем выбранный вариант
    goToNext(optionIndex);           // Переходим к следующему вопросу
  };

  // === РАСЧЁТЫ ДЛЯ КРУГОВОГО ТАЙМЕРА ===
  // Круговой таймер рисуется с помощью SVG (векторная графика)
  
  // Длина окружности круга (2 * π * радиус)
  const circumference = 2 * Math.PI * 45; // радиус = 45
  
  // Смещение для анимации "убывания" круга
  const strokeDashoffset = circumference - (timeLeft / TIMER_DURATION) * circumference;
  
  // Цвет таймера меняется: зелёный → жёлтый → красный
  const timerColor = timeLeft > 4 ? '#10b981' : timeLeft > 2 ? '#f59e0b' : '#ef4444';

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      
      {/* === ВЕРХНЯЯ ПАНЕЛЬ: прогресс-бар и таймер === */}
      <div className="max-w-md mx-auto w-full">
        
        {/* Номер вопроса */}
        <div className="text-center mb-2">
          <span className="text-sm text-gray-400 font-medium">
            Вопрос {currentQuestion + 1} из {totalQuestions}
          </span>
        </div>
        
        {/* Прогресс-бар — показывает сколько вопросов пройдено */}
        <div className="progress-bar-container mb-6">
          <div 
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      
      {/* === ОСНОВНОЙ КОНТЕНТ: вопрос и варианты === */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        
        {/* Круговой таймер — показывает оставшееся время */}
        <div className="relative mb-6">
          {/* SVG-круг для таймера */}
          <svg width="80" height="80" viewBox="0 0 100 100" className="transform -rotate-90">
            {/* Фоновый круг (серый) */}
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="6"
            />
            {/* Анимированный круг (цветной) — уменьшается со временем */}
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke={timerColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
            />
          </svg>
          {/* Число секунд внутри круга */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className="text-2xl font-bold"
              style={{ color: timerColor }}
            >
              {timeLeft}
            </span>
          </div>
        </div>
        
        {/* Эмодзи вопроса */}
        <div className={`text-5xl mb-4 ${isTransitioning ? 'opacity-0' : 'animate-scaleIn'}`}>
          {question.emoji}
        </div>
        
        {/* Текст вопроса */}
        <h2 className={`text-2xl font-bold text-gray-900 text-center mb-8 ${isTransitioning ? 'opacity-0' : 'animate-fadeIn'}`}>
          {question.text}
        </h2>
        
        {/* Варианты ответа */}
        <div className={`w-full space-y-3 ${isTransitioning ? 'opacity-0' : 'animate-fadeIn'}`}>
          {question.options.map((option, index) => (
            <button
              key={`${currentQuestion}-${index}`}
              onClick={() => handleSelect(index)}
              disabled={isTransitioning}
              className={`answer-option ${selectedOption === index ? 'selected' : ''}`}
              style={{
                /* Каждый вариант появляется с небольшой задержкой */
                animation: isTransitioning ? 'none' : `fadeInUp 0.3s ease-out ${index * 0.08}s forwards`,
                opacity: isTransitioning ? 0 : undefined
              }}
            >
              {/* Буква варианта (A, B, C, D) и текст */}
              <span className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-semibold text-gray-500">
                  {String.fromCharCode(65 + index)} {/* 65 = 'A' в ASCII */}
                </span>
                <span>{option}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizScreen;
