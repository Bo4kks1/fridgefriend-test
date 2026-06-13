/**
 * КОМПОНЕНТ ШЕРИНГА РЕЗУЛЬТАТА
 * 
 * Открывается при нажатии «Поделиться результатом» на экране результата.
 * Даёт пользователю два варианта:
 * 
 * 1. ОТПРАВИТЬ В МЕССЕНДЖЕРЫ / СОЦСЕТИ:
 *    - Telegram
 *    - WhatsApp
 *    - Скопировать текст
 * 
 * 2. СОХРАНИТЬ КАРТИНКУ:
 *    - Генерирует PNG-карточку с результатом
 *    - Скачивает файл на устройство пользователя
 * 
 * Также показывает превью карточки, которая будет сохранена.
 */

import React, { useState, useRef } from 'react';
import { getResultLevel } from '../data/questions';
import { toPng } from 'html-to-image';

interface ShareScreenProps {
  matchPercent: number;   // Процент совпадения (для карточки и текста)
  onBack: () => void;     // Вернуться к результату
}

const ShareScreen: React.FC<ShareScreenProps> = ({ matchPercent, onBack }) => {
  // === СОСТОЯНИЯ ===
  
  // Показывает, была ли скопирована ссылка
  const [copied, setCopied] = useState(false);
  
  // Показывает, идёт ли генерация PNG-картинки
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Ref (ссылка) на HTML-элемент карточки — нужен, чтобы превратить его в картинку
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Получаем данные уровня (название, эмодзи, цвет)
  const level = getResultLevel(matchPercent);
  
  // Формируем текст, который будет отправлен в мессенджеры
  const shareText = `🧊 Мы прошли тест «Кто съел мой йогурт?»!\n\n${level.emoji} Наш результат: ${matchPercent}% — ${level.title}\n\nПройди тест со своим партнёром:`;
  const shareUrl = `${window.location.origin}${window.location.pathname}`;
  
  /**
   * КОПИРОВАНИЕ ТЕКСТА В БУФЕР ОБМЕНА
   * Копирует текст результата + ссылку на тест
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  /**
   * ОТПРАВКА В TELEGRAM
   * Открывает стандартное окно шеринга Telegram в новой вкладке
   */
  const handleTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };
  
  /**
   * ОТПРАВКА В WHATSAPP
   * Открывает WhatsApp с готовым сообщением
   */
  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
    window.open(url, '_blank');
  };

  /**
   * СОХРАНЕНИЕ КАРТИНКИ (PNG)
   * 
   * Берёт HTML-элемент карточки (cardRef) и преобразует его 
   * в PNG-изображение с помощью библиотеки html-to-image.
   * Затем автоматически скачивает файл на устройство.
   */
  const handleSaveImage = async () => {
    // Если карточка не найдена или уже идёт генерация — выходим
    if (!cardRef.current || isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      // Преобразуем HTML-блок в PNG-картинку (data URL)
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,       // Качество изображения (95%)
        pixelRatio: 2,       // Удвоенное разрешение (для чёткости на Retina-экранах)
        backgroundColor: '#fefce8', // Цвет фона
      });
      
      // Создаём невидимую ссылку и кликаем по ней — это запускает скачивание
      const link = document.createElement('a');
      link.download = 'fridgefriend-result.png'; // Имя скачиваемого файла
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Ошибка при создании изображения:', error);
    }
    
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md mx-auto w-full animate-fadeInUp">
        
        {/* === ЗАГОЛОВОК ЭКРАНА === */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          📤 Поделиться результатом
        </h2>

        {/* === МИНИ-КАРТОЧКА ДЛЯ ГЕНЕРАЦИИ PNG ===
            Этот блок будет «сфотографирован» и сохранён как картинка.
            Он виден пользователю как превью. */}
        <div 
          ref={cardRef}
          className="share-card mb-6"
        >
          {/* Эмодзи уровня */}
          <div className="text-4xl mb-3 relative z-10">
            {level.emoji}
          </div>
          
          {/* Процент совпадения */}
          <div 
            className="text-5xl font-extrabold mb-1 relative z-10"
            style={{ color: level.color }}
          >
            {matchPercent}%
          </div>
          
          <p className="text-gray-400 text-xs mb-3 relative z-10">совпадение</p>
          
          {/* Название уровня */}
          <h3 
            className="text-lg font-bold mb-2 relative z-10"
            style={{ color: level.color }}
          >
            {level.title}
          </h3>
          
          {/* Подпись — фраза для шеринга */}
          <p className="text-gray-500 text-xs relative z-10">
            Мы прошли тест «Кто съел мой йогурт?»
          </p>
          
          {/* Лого теста */}
          <div className="mt-4 pt-3 border-t border-amber-200 relative z-10">
            <p className="text-xs text-gray-400">🧊 fridgefriend</p>
          </div>
        </div>

        {/* === ДВА СПОСОБА ПОДЕЛИТЬСЯ ===
            Используем визуальные разделители, чтобы пользователь
            видел два чётких варианта: соцсети ИЛИ картинка */}

        {/* --- ВАРИАНТ 1: Отправить в мессенджеры --- */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3 text-center">
            Отправить в мессенджер
          </p>
          
          <div className="space-y-2">
            {/* Кнопка Telegram */}
            <button 
              onClick={handleTelegram}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-[#2AABEE] text-white rounded-2xl font-semibold text-base hover:bg-[#229ED9] transition-colors"
            >
              {/* SVG-иконка Telegram */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram
            </button>
            
            {/* Кнопка WhatsApp */}
            <button 
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-[#25D366] text-white rounded-2xl font-semibold text-base hover:bg-[#20BD5A] transition-colors"
            >
              {/* SVG-иконка WhatsApp */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>
            
            {/* Кнопка копирования текста — те же размеры, что и кнопки выше */}
            <button 
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white text-gray-800 border-2 border-gray-200 rounded-2xl font-semibold text-base hover:border-amber-400 hover:bg-amber-50 transition-colors"
            >
              {copied ? '✅ Скопировано!' : '📋 Скопировать текст'}
            </button>
          </div>
        </div>

        {/* --- Разделитель "или" --- */}
        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">или</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* --- ВАРИАНТ 2: Сохранить как картинку --- */}
        <div className="mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3 text-center">
            Сохранить картинку
          </p>
          
          {/* Кнопка скачивания PNG-карточки */}
          <button 
            onClick={handleSaveImage}
            disabled={isGenerating}
            className={`w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-gray-900 text-white rounded-2xl font-semibold text-base hover:bg-gray-800 transition-colors ${isGenerating ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isGenerating ? (
              /* Во время генерации показываем индикатор загрузки */
              <>
                {/* Простая анимация вращения */}
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Создаём картинку...
              </>
            ) : (
              <>
                🖼 Сохранить как PNG
              </>
            )}
          </button>
        </div>
        
        {/* --- Кнопка "Назад" --- */}
        <button 
          onClick={onBack}
          className="w-full py-3 text-gray-500 text-sm hover:text-gray-700 transition-colors text-center"
        >
          ← Вернуться к результату
        </button>
      </div>
    </div>
  );
};

export default ShareScreen;
