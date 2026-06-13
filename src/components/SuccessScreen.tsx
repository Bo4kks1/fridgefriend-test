/**
 * КОМПОНЕНТ УСПЕШНОЙ ОТПРАВКИ
 * 
 * Показывается после того, как пользователь отправил форму
 * с контактными данными. Содержит:
 * - Сообщение об успехе
 * - Информацию о том, что будет дальше
 * - Кнопку "Пройти тест заново"
 */

import React from 'react';

interface SuccessScreenProps {
  contactMethod: 'email' | 'telegram'; // Какой способ связи выбрал пользователь
  onRestart: () => void;               // Начать тест заново
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ contactMethod, onRestart }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md mx-auto w-full text-center animate-scaleIn">
        
        {/* Большая галочка */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        
        {/* Заголовок */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Отлично! Всё получилось
        </h2>
        
        {/* Описание — зависит от выбранного способа связи */}
        <p className="text-gray-500 mb-6">
          {contactMethod === 'telegram' ? (
            <>Мы&nbsp;свяжемся с&nbsp;вами в&nbsp;Telegram, когда ФриджФренд будет готов к&nbsp;запуску.</>
          ) : (
            <>Мы&nbsp;отправим ранний доступ к&nbsp;ФриджФренд на&nbsp;указанный email. Проверьте почту (и&nbsp;папку «Спам» на&nbsp;всякий случай).</>
          )}
        </p>
        
        {/* Благодарность */}
        <div className="bg-purple-50 rounded-2xl p-5 mb-6 border border-purple-100">
          <p className="text-sm text-purple-800">
            🙏 Спасибо за участие! Вы&nbsp;среди первых, кто получит доступ к&nbsp;приложению 
            <span className="font-semibold"> ФриджФренд</span> — вашему помощнику в&nbsp;управлении холодильником!
          </p>
        </div>
        
        {/* Кнопка "Пройти заново" */}
        <button 
          onClick={onRestart}
          className="w-full py-3.5 px-6 bg-white text-gray-600 border-2 border-gray-200 rounded-2xl font-medium text-base hover:border-gray-300 hover:text-gray-800 transition-all cursor-pointer"
        >
          🔄 Пройти тест заново
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
