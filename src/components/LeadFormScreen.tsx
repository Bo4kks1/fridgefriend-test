/**
 * КОМПОНЕНТ ФОРМЫ СБОРА КОНТАКТОВ (ЛИДОГЕНЕРАЦИЯ)
 * 
 * Это экран, где пользователь может оставить свои контакты,
 * чтобы получить ранний доступ к приложению ФриджФренд.
 * 
 * Поля:
 * - Имя (необязательно)
 * - Email или Telegram (одно из двух обязательно)
 * - Чекбокс согласия на обработку данных
 * 
 * Валидация:
 * - Telegram: должен начинаться с @
 * - Email: проверка формата (наличие @ и домена)
 * 
 * Защита от повторной отправки формы:
 * - После отправки кнопка блокируется
 * - Данные сохраняются в localStorage
 */

import React, { useState } from 'react';
import { LeadData } from '../utils/session';

interface LeadFormScreenProps {
  onSubmit: (data: LeadData) => void;  // Функция при отправке формы
  onBack: () => void;                  // Вернуться к результату
}

const LeadFormScreen: React.FC<LeadFormScreenProps> = ({ onSubmit, onBack }) => {
  // === СОСТОЯНИЯ ПОЛЕЙ ФОРМЫ ===
  
  const [name, setName] = useState('');          // Имя
  const [email, setEmail] = useState('');         // Email
  const [telegram, setTelegram] = useState('');   // Telegram
  const [consent, setConsent] = useState(false);  // Согласие на обработку данных
  const [isSubmitting, setIsSubmitting] = useState(false); // Идёт ли отправка
  const [error, setError] = useState('');         // Текст ошибки
  
  // Какой способ связи выбран: email (по умолчанию) или telegram
  const [contactMethod, setContactMethod] = useState<'email' | 'telegram'>('email');

  /**
   * ПРОВЕРКА ФОРМАТА EMAIL
   * 
   * Регулярное выражение проверяет, что строка соответствует формату:
   * - есть текст до @
   * - есть @ 
   * - есть домен после @
   * - есть точка и минимум 2 символа в конце (например .ru, .com)
   */
  const isValidEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(value);
  };

  /**
   * ПРОВЕРКА ФОРМАТА TELEGRAM
   * 
   * Telegram-ник должен:
   * - начинаться с @
   * - содержать минимум 5 символов после @ (ограничение Telegram)
   * - содержать только буквы, цифры и подчёркивания
   */
  const isValidTelegram = (value: string): boolean => {
    const tgRegex = /^@[a-zA-Z0-9_]{4,}$/;
    return tgRegex.test(value);
  };

  /**
   * ОБРАБОТКА ОТПРАВКИ ФОРМЫ
   * 
   * Проверяет, что все обязательные поля заполнены корректно,
   * и отправляет данные.
   */
  const handleSubmit = (e: React.FormEvent) => {
    // Предотвращаем стандартное поведение формы (перезагрузку страницы)
    e.preventDefault();
    
    // Сбрасываем ошибку
    setError('');
    
    // === ВАЛИДАЦИЯ (проверка данных) ===
    
    if (contactMethod === 'telegram') {
      // Проверяем, заполнено ли поле Telegram
      if (!telegram.trim()) {
        setError('Пожалуйста, введите ваш Telegram');
        return;
      }
      // Проверяем, начинается ли ник с @
      if (!telegram.trim().startsWith('@')) {
        setError('Telegram должен начинаться с @ (например @username)');
        return;
      }
      // Проверяем полный формат ника
      if (!isValidTelegram(telegram.trim())) {
        setError('Введите корректный Telegram (например @username, минимум 5 символов после @)');
        return;
      }
    }
    
    if (contactMethod === 'email') {
      // Проверяем, заполнено ли поле Email
      if (!email.trim()) {
        setError('Пожалуйста, введите email');
        return;
      }
      // Проверяем формат email
      if (!isValidEmail(email.trim())) {
        setError('Введите корректный email (например name@mail.ru)');
        return;
      }
    }
    
    // Проверяем согласие на обработку данных
    if (!consent) {
      setError('Необходимо согласие на обработку данных');
      return;
    }
    
    // === ОТПРАВКА ===
    setIsSubmitting(true);
    
    // Формируем объект с данными
    const leadData: LeadData = {
      name: name.trim(),
      email: contactMethod === 'email' ? email.trim() : '',
      telegram: contactMethod === 'telegram' ? telegram.trim() : '',
      consent: true,
    };
    
    // Имитируем задержку отправки (в реальном проекте здесь будет запрос к серверу)
    setTimeout(() => {
      onSubmit(leadData);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md mx-auto w-full animate-fadeInUp">
        
        {/* Иконка */}
        <div className="text-5xl text-center mb-4">📲</div>
        
        {/* Заголовок */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Попробуйте ФриджФренд
        </h2>
        
        {/* Подзаголовок — без упоминания чек-листа */}
        <p className="text-center text-gray-500 mb-8 text-sm">
          Оставьте контакт и&nbsp;получите ранний доступ к&nbsp;приложению для&nbsp;управления вашим холодильником
        </p>
        
        {/* === ФОРМА === */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Поле "Имя" (необязательное) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя <span className="text-gray-400">(необязательно)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Как вас зовут?"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-amber-400 transition-colors bg-white"
            />
          </div>
          
          {/* Переключатель: Email или Telegram */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Способ связи <span className="text-red-400">*</span>
            </label>
            
            {/* Табы для выбора способа — Email первый (основной), Telegram второй */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => { setContactMethod('email'); setError(''); }}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  contactMethod === 'email'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => { setContactMethod('telegram'); setError(''); }}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  contactMethod === 'telegram'
                    ? 'bg-[#2AABEE] text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Telegram
              </button>
            </div>
            
            {/* Поле ввода — меняется в зависимости от выбранного способа */}
            {contactMethod === 'telegram' ? (
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-[#2AABEE] transition-colors bg-white"
              />
            ) : (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@mail.ru"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-amber-400 transition-colors bg-white"
              />
            )}
          </div>
          
          {/* Чекбокс согласия на обработку данных */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
            />
            <label htmlFor="consent" className="text-sm text-gray-500 cursor-pointer">
              Я&nbsp;согласен(а) на&nbsp;обработку персональных данных и&nbsp;получение информационных сообщений
            </label>
          </div>
          
          {/* Сообщение об ошибке */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              ⚠️ {error}
            </div>
          )}
          
          {/* Кнопка отправки — на всю ширину, такого же размера как поля ввода.
              py-3 и rounded-xl совпадают с полями ввода для визуальной гармонии */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold text-base hover:from-purple-600 hover:to-indigo-600 transition-all cursor-pointer ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? '⏳ Отправляем...' : 'Получить ранний доступ'}
          </button>
        </form>
        
        {/* Кнопка "Назад" */}
        <button 
          onClick={onBack}
          className="w-full py-3 mt-3 text-gray-400 text-sm hover:text-gray-600 transition-colors cursor-pointer"
        >
          ← Вернуться к результату
        </button>
      </div>
    </div>
  );
};

export default LeadFormScreen;
