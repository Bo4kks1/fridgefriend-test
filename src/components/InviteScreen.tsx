/**
 * КОМПОНЕНТ ПРИГЛАШЕНИЯ ПАРТНЁРА
 * 
 * Показывается после того, как первый участник решил начать тест.
 * Здесь пользователь может:
 * - Поделиться ссылкой в Telegram
 * - Поделиться ссылкой в WhatsApp
 * - Скопировать ссылку в буфер обмена
 * 
 * Ссылка содержит уникальный ID сессии, чтобы второй участник
 * попал в ту же сессию.
 */

import React, { useState } from 'react';

interface InviteScreenProps {
  sessionId: string;            // ID текущей сессии
  onProceed: () => void;        // Функция перехода к тесту (пройти самому)
}

const InviteScreen: React.FC<InviteScreenProps> = ({ sessionId, onProceed }) => {
  // Состояние для показа сообщения "Ссылка скопирована"
  const [copied, setCopied] = useState(false);
  
  // Формируем ссылку для партнёра
  // window.location.origin — это адрес текущего сайта (например, https://example.com)
  // К нему добавляем параметр session с ID сессии и player=2 (второй участник)
  const shareUrl = `${window.location.origin}${window.location.pathname}?session=${sessionId}&player=2`;
  
  // Текст сообщения для шеринга
  const shareText = '🧊 Пройди тест «Кто съел мой йогурт?» — проверим, насколько мы синхронизированы!';
  
  /**
   * Копирование ссылки в буфер обмена
   * Использует встроенный API браузера navigator.clipboard
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      // Через 2 секунды убираем сообщение "Скопировано"
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Если API не поддерживается — используем fallback
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
  
  /**
   * Открывает Telegram с подготовленным сообщением
   * t.me/share/url — стандартный URL для шеринга в Telegram
   */
  const handleTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };
  
  /**
   * Открывает WhatsApp с подготовленным сообщением
   * wa.me — стандартный URL для шеринга в WhatsApp
   */
  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md mx-auto w-full text-center animate-fadeInUp">
        
        {/* Эмодзи-иконка */}
        <div className="text-6xl mb-6">📨</div>
        
        {/* Заголовок экрана */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Пригласите того, с&nbsp;кем вы делите холодильник
        </h2>
        
        {/* Подсказка */}
        <p className="text-gray-500 mb-8">
          Отправьте ссылку партнёру — каждый пройдёт тест отдельно, 
          а&nbsp;потом увидите совпадения
        </p>
        
        {/* Кнопки для шеринга */}
        <div className="space-y-3 mb-8">
          
          {/* Кнопка Telegram */}
          <button 
            onClick={handleTelegram}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#2AABEE] text-white rounded-2xl font-semibold text-base hover:bg-[#229ED9] transition-colors"
          >
            {/* SVG-иконка Telegram */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Поделиться в Telegram
          </button>
          
          {/* Кнопка WhatsApp */}
          <button 
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#25D366] text-white rounded-2xl font-semibold text-base hover:bg-[#20BD5A] transition-colors"
          >
            {/* SVG-иконка WhatsApp */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Поделиться в WhatsApp
          </button>
          
          {/* Кнопка копирования ссылки */}
          <button 
            onClick={handleCopy}
            className="btn-secondary"
          >
            {copied ? '✅ Ссылка скопирована!' : '🔗 Скопировать ссылку'}
          </button>
        </div>
        
        {/* Разделительная линия */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">или</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        
        {/* Кнопка "Пройти тест первым" */}
        <button 
          onClick={onProceed}
          className="btn-primary"
        >
          ✍️ Пройти тест первым
        </button>
        
        {/* Подсказка */}
        <p className="text-xs text-gray-400 mt-4">
          Вы можете отправить ссылку позже — она будет активна
        </p>
      </div>
    </div>
  );
};

export default InviteScreen;
