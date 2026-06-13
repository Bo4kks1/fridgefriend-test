/**
 * МОДУЛЬ ЭКСПОРТА ДАННЫХ В EXCEL
 * 
 * Этот файл отвечает за сохранение контактных данных (лидов)
 * в Excel-файл (.xlsx). При каждой отправке формы данные
 * добавляются в общий список и файл автоматически скачивается.
 * 
 * Используется библиотека SheetJS (xlsx) для создания Excel-файлов.
 */

import * as XLSX from 'xlsx';
import { Session, getAllSessions } from './session';

/**
 * Интерфейс для строки в Excel-таблице
 * Каждая строка содержит данные одной сессии/лида
 */
interface ExcelRow {
  'Дата': string;
  'ID сессии': string;
  'Имя': string;
  'Email': string;
  'Telegram': string;
  'Процент совпадения': string;
  'Уровень': string;
  'Ответы участника 1': string;
  'Ответы участника 2': string;
  'Источник трафика': string;
}

/**
 * Получение названия уровня по проценту
 */
function getLevelName(percent: number | null): string {
  if (percent === null) return '—';
  if (percent <= 29) return 'Синхронизация не удалась';
  if (percent <= 59) return 'Параллельные полки';
  if (percent <= 84) return 'Почти команда';
  return 'Повелители холодильника';
}

/**
 * Форматирование даты в читаемый вид
 * Пример: "15.01.2025, 14:30"
 */
function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}

/**
 * Преобразование сессии в строку для Excel
 */
function sessionToRow(session: Session): ExcelRow {
  return {
    'Дата': formatDate(session.createdAt),
    'ID сессии': session.id,
    'Имя': session.leadData?.name || '—',
    'Email': session.leadData?.email || '—',
    'Telegram': session.leadData?.telegram || '—',
    'Процент совпадения': session.matchPercent !== null ? `${session.matchPercent}%` : '—',
    'Уровень': getLevelName(session.matchPercent),
    'Ответы участника 1': session.player1Answers.length > 0 
      ? session.player1Answers.map(a => a + 1).join(', ') 
      : '—',
    'Ответы участника 2': session.player2Answers.length > 0 
      ? session.player2Answers.map(a => a + 1).join(', ') 
      : '—',
    'Источник трафика': session.utmSource || 'direct'
  };
}

/**
 * ЭКСПОРТ ВСЕХ ЛИДОВ В EXCEL
 * 
 * Собирает все сессии с контактными данными из localStorage
 * и создаёт Excel-файл для скачивания.
 * 
 * Возвращает количество экспортированных записей.
 */
export function exportAllLeadsToExcel(): number {
  // Получаем все сессии из хранилища
  const allSessions = getAllSessions();
  
  // Фильтруем только те, где есть контактные данные (лиды)
  const sessionsWithLeads = allSessions.filter(
    session => session.leadData && (session.leadData.email || session.leadData.telegram)
  );
  
  if (sessionsWithLeads.length === 0) {
    console.log('Нет данных для экспорта');
    return 0;
  }
  
  // Преобразуем сессии в строки таблицы
  const rows: ExcelRow[] = sessionsWithLeads.map(sessionToRow);
  
  // Создаём рабочую книгу Excel
  const workbook = XLSX.utils.book_new();
  
  // Создаём лист из данных
  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Настраиваем ширину колонок для читаемости
  worksheet['!cols'] = [
    { wch: 18 },  // Дата
    { wch: 14 },  // ID сессии
    { wch: 15 },  // Имя
    { wch: 25 },  // Email
    { wch: 18 },  // Telegram
    { wch: 12 },  // Процент
    { wch: 25 },  // Уровень
    { wch: 20 },  // Ответы 1
    { wch: 20 },  // Ответы 2
    { wch: 15 },  // Источник
  ];
  
  // Добавляем лист в книгу
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Лиды');
  
  // Генерируем имя файла с текущей датой
  const today = new Date().toISOString().split('T')[0]; // формат: 2025-01-15
  const filename = `fridgefriend-leads-${today}.xlsx`;
  
  // Скачиваем файл
  XLSX.writeFile(workbook, filename);
  
  console.log(`✅ Экспортировано ${rows.length} записей в файл ${filename}`);
  
  return rows.length;
}

/**
 * ЭКСПОРТ ОДНОЙ СЕССИИ В EXCEL
 * 
 * Создаёт Excel-файл с данными конкретной сессии.
 * Используется при отправке формы — сразу сохраняем данные.
 */
export function exportSessionToExcel(session: Session): void {
  if (!session.leadData) {
    console.log('В сессии нет контактных данных');
    return;
  }
  
  // Получаем все существующие лиды + добавляем текущий
  const allSessions = getAllSessions();
  const sessionsWithLeads = allSessions.filter(
    s => s.leadData && (s.leadData.email || s.leadData.telegram)
  );
  
  // Преобразуем в строки таблицы
  const rows: ExcelRow[] = sessionsWithLeads.map(sessionToRow);
  
  // Создаём рабочую книгу Excel
  const workbook = XLSX.utils.book_new();
  
  // Создаём лист из данных
  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Настраиваем ширину колонок
  worksheet['!cols'] = [
    { wch: 18 },  // Дата
    { wch: 14 },  // ID сессии
    { wch: 15 },  // Имя
    { wch: 25 },  // Email
    { wch: 18 },  // Telegram
    { wch: 12 },  // Процент
    { wch: 25 },  // Уровень
    { wch: 20 },  // Ответы 1
    { wch: 20 },  // Ответы 2
    { wch: 15 },  // Источник
  ];
  
  // Добавляем лист в книгу
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Лиды');
  
  // Генерируем имя файла
  const today = new Date().toISOString().split('T')[0];
  const filename = `fridgefriend-leads-${today}.xlsx`;
  
  // Скачиваем файл
  XLSX.writeFile(workbook, filename);
  
  console.log(`✅ Данные сохранены в файл ${filename} (всего ${rows.length} записей)`);
}
