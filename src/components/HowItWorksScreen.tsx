/**
 * КОМПОНЕНТ "КАК ЭТО РАБОТАЕТ"
 * 
 * Объясняет пользователю процесс прохождения теста в 3 простых шага.
 * Каждый шаг показан с номером, иконкой и описанием.
 * Внизу — кнопка для начала теста.
 */

import React from 'react';

// Свойства компонента
interface HowItWorksScreenProps {
  onStart: () => void; // Функция при нажатии "Начать"
}

const HowItWorksScreen: React.FC<HowItWorksScreenProps> = ({ onStart }) => {
  // Массив шагов — каждый шаг содержит номер, эмодзи и описание
  const steps = [
    {
      number: 1,
      emoji: '👫',
      title: 'Пригласите партнёра',
      description: 'Отправьте ссылку тому, с кем делите холодильник'
    },
    {
      number: 2,
      emoji: '📝',
      title: 'Ответьте на 7 вопросов',
      description: 'Каждый отвечает самостоятельно — честно!'
    },
    {
      number: 3,
      emoji: '📊',
      title: 'Узнайте результат',
      description: 'Сравним ваши ответы и покажем уровень синхронизации'
    }
  ];

  return (
    /* Контейнер экрана с центрированием */
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md mx-auto w-full animate-fadeInUp">
        
        {/* Заголовок секции */}
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
          Как это работает?
        </h2>
        
        {/* Список шагов */}
        <div className="space-y-6 mb-10">
          {steps.map((step, index) => (
            /* Каждый шаг — карточка с номером, иконкой и текстом */
            <div 
              key={step.number}
              className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              style={{ 
                /* Задержка анимации — каждый шаг появляется чуть позже предыдущего */
                animationDelay: `${index * 0.15}s`,
                animation: `fadeInUp 0.5s ease-out ${index * 0.15}s forwards`,
                opacity: 0 
              }}
            >
              {/* Номер шага в кружке */}
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {step.number}
              </div>
              
              {/* Текст шага */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{step.emoji}</span>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-gray-500 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Кнопка "Начать" */}
        <div className="text-center">
          <button 
            onClick={onStart}
            className="btn-primary"
          >
            Начать
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksScreen;
