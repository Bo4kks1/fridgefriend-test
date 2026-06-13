/**
 * МОДУЛЬ ИНТЕГРАЦИИ С GOOGLE SHEETS
 * 
 * Этот файл отвечает за отправку данных лидов в Google-таблицу.
 * 
 * КАК ЭТО РАБОТАЕТ:
 * 1. Вы создаёте Google-таблицу
 * 2. Добавляете туда скрипт (Google Apps Script)
 * 3. Публикуете скрипт как веб-приложение
 * 4. Вставляете URL скрипта в переменную GOOGLE_SCRIPT_URL ниже
 * 5. При отправке формы данные автоматически записываются в таблицу
 * 
 * Подробная инструкция — в файле README.md
 */

import { Session } from './session';

/**
 * ⚠️ ВАЖНО: Вставьте сюда URL вашего Google Apps Script
 * 
 * Как получить URL — смотрите инструкцию в README.md
 * Пример URL: https://script.google.com/macros/s/AKfycbw.../exec
 */
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbygGBR1ZolvAVk-lAR9eyvWeyWE8uw7gp0TT_9aRiwFIm0y4jG59_gszNViS9UYu97a4g/exec';

/**
 * Получение названия уровня по проценту совпадения
 */
function getLevelName(percent: number | null): string {
  if (percent === null) return '—';
  if (percent <= 29) return 'Синхронизация не удалась';
  if (percent <= 59) return 'Параллельные полки';
  if (percent <= 84) return 'Почти команда';
  return 'Повелители холодильника';
}

/**
 * Интерфейс данных, отправляемых в Google Sheets
 */
interface SheetData {
  timestamp: string;       // Дата и время
  sessionId: string;       // ID сессии
  name: string;            // Имя пользователя
  email: string;           // Email
  telegram: string;        // Telegram
  matchPercent: string;    // Процент совпадения
  level: string;           // Название уровня
  player1Answers: string;  // Ответы участника 1
  player2Answers: string;  // Ответы участника 2
  utmSource: string;       // Источник трафика
}

/**
 * ОТПРАВКА ДАННЫХ В GOOGLE SHEETS
 * 
 * Отправляет данные сессии в Google-таблицу через Google Apps Script.
 * Если URL скрипта не настроен — просто выводит данные в консоль.
 * 
 * @param session - объект сессии с данными теста и лида
 * @returns Promise<boolean> - успешно ли отправлены данные
 */
export async function sendToGoogleSheets(session: Session): Promise<boolean> {
  // Проверяем, настроен ли URL скрипта
  if (!GOOGLE_SCRIPT_URL) {
    console.log('⚠️ Google Sheets не настроен. Вставьте URL скрипта в файл src/utils/googleSheets.ts');
    console.log('📊 Данные для отправки:', session);
    return false;
  }

  // Проверяем, есть ли данные лида
  if (!session.leadData) {
    console.log('⚠️ В сессии нет контактных данных');
    return false;
  }

  // Подготавливаем данные для отправки
  const data: SheetData = {
    timestamp: new Date().toLocaleString('ru-RU'),
    sessionId: session.id,
    name: session.leadData.name || '—',
    email: session.leadData.email || '—',
    telegram: session.leadData.telegram || '—',
    matchPercent: session.matchPercent !== null ? `${session.matchPercent}%` : '—',
    level: getLevelName(session.matchPercent),
    player1Answers: session.player1Answers.length > 0 
      ? session.player1Answers.map(a => a + 1).join(', ') 
      : '—',
    player2Answers: session.player2Answers.length > 0 
      ? session.player2Answers.map(a => a + 1).join(', ') 
      : '—',
    utmSource: session.utmSource || 'direct',
  };

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    const result = await response.json();
  
    if (result.success) {
      console.log('✅ Данные отправлены в Google Sheets');
      return true;
    } else {
      console.error('❌ Ошибка от сервера:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка отправки в Google Sheets:', error);
    return false;
  }
}

/**
 * ПРОВЕРКА НАСТРОЙКИ GOOGLE SHEETS
 * 
 * Возвращает true, если URL скрипта настроен
 */
export function isGoogleSheetsConfigured(): boolean {
  return GOOGLE_SCRIPT_URL.length > 0;
}
