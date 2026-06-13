/**
 * МОДУЛЬ УПРАВЛЕНИЯ СЕССИЯМИ
 * 
 * Этот файл отвечает за:
 * - Создание уникальных сессий теста (каждый тест = уникальная сессия)
 * - Сохранение ответов участников
 * - Проверку, завершили ли оба участника тест
 * - Подсчёт процента совпадений
 * 
 * Данные хранятся в localStorage браузера (встроенное хранилище).
 * В реальном проекте данные отправлялись бы на сервер.
 */

// Описание структуры сессии — какие данные мы храним
export interface Session {
  id: string;                    // Уникальный ID сессии
  createdAt: string;             // Дата и время создания
  player1Answers: number[];      // Ответы первого участника (номера выбранных вариантов)
  player2Answers: number[];      // Ответы второго участника
  player1Completed: boolean;     // Завершил ли первый участник тест
  player2Completed: boolean;     // Завершил ли второй участник тест
  matchPercent: number | null;   // Процент совпадений (null = ещё не подсчитан)
  leadData: LeadData | null;     // Контактные данные (если пользователь оставил)
  utmSource: string;             // Источник трафика (откуда пришёл пользователь)
}

// Данные для лидогенерации (контактная информация)
export interface LeadData {
  name: string;       // Имя пользователя (необязательно)
  email: string;      // Email (один из двух обязательных)
  telegram: string;   // Telegram (один из двух обязательных)
  consent: boolean;   // Согласие на обработку данных
}

/**
 * Генерация уникального ID сессии
 * 
 * Создаёт случайную строку из букв и цифр длиной 8 символов.
 * Пример: "a3f7b2e1"
 * 
 * Этот ID будет частью ссылки, которую первый участник
 * отправляет второму.
 */
export function generateSessionId(): string {
  // Берём случайное число, преобразуем в строку из букв/цифр
  // и берём первые 8 символов
  return Math.random().toString(36).substring(2, 10) + 
         Math.random().toString(36).substring(2, 6);
}

/**
 * Создание новой сессии
 * 
 * Вызывается, когда первый участник нажимает "Начать тест".
 * Создаёт пустую сессию и сохраняет в localStorage.
 */
export function createSession(): Session {
  // Создаём объект сессии с пустыми данными
  const session: Session = {
    id: generateSessionId(),
    createdAt: new Date().toISOString(),
    player1Answers: [],
    player2Answers: [],
    player1Completed: false,
    player2Completed: false,
    matchPercent: null,
    leadData: null,
    utmSource: getUtmSource(), // Автоматически определяем источник трафика
  };
  
  // Сохраняем сессию в хранилище браузера
  saveSession(session);
  return session;
}

/**
 * Сохранение сессии в localStorage
 * 
 * localStorage — это встроенное хранилище браузера.
 * Данные сохраняются даже после закрытия вкладки.
 */
export function saveSession(session: Session): void {
  // Получаем все существующие сессии
  const sessions = getAllSessions();
  // Находим индекс текущей сессии (если она уже существует)
  const index = sessions.findIndex(s => s.id === session.id);
  
  if (index >= 0) {
    // Если сессия уже есть — обновляем её
    sessions[index] = session;
  } else {
    // Если новая — добавляем в список
    sessions.push(session);
  }
  
  // Сохраняем обновлённый список в localStorage
  // JSON.stringify превращает объект в текстовую строку для хранения
  localStorage.setItem('yogurt_sessions', JSON.stringify(sessions));
}

/**
 * Получение всех сохранённых сессий
 */
export function getAllSessions(): Session[] {
  // Читаем данные из localStorage
  const data = localStorage.getItem('yogurt_sessions');
  // Если данных нет — возвращаем пустой массив
  if (!data) return [];
  // Парсим (превращаем текст обратно в объект)
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Получение конкретной сессии по ID
 * 
 * Используется когда второй участник переходит по ссылке —
 * мы находим сессию по ID из ссылки.
 */
export function getSession(id: string): Session | null {
  const sessions = getAllSessions();
  return sessions.find(s => s.id === id) || null;
}

/**
 * Сохранение ответов участника
 * 
 * @param sessionId — ID сессии
 * @param playerNumber — номер участника (1 или 2)
 * @param answers — массив номеров выбранных ответов
 */
export function saveAnswers(
  sessionId: string, 
  playerNumber: 1 | 2, 
  answers: number[]
): Session | null {
  // Находим сессию
  const session = getSession(sessionId);
  if (!session) return null;
  
  if (playerNumber === 1) {
    // Сохраняем ответы первого участника
    session.player1Answers = answers;
    session.player1Completed = true;
  } else {
    // Сохраняем ответы второго участника
    session.player2Answers = answers;
    session.player2Completed = true;
  }
  
  // Если оба завершили — считаем процент совпадений
  if (session.player1Completed && session.player2Completed) {
    session.matchPercent = calculateMatch(
      session.player1Answers, 
      session.player2Answers
    );
  }
  
  // Сохраняем обновлённую сессию
  saveSession(session);
  return session;
}

/**
 * ПОДСЧЁТ ПРОЦЕНТА СОВПАДЕНИЙ
 * 
 * Сравнивает ответы двух участников вопрос за вопросом.
 * Если на один и тот же вопрос оба выбрали одинаковый вариант —
 * это совпадение.
 * 
 * Формула: (количество совпадений / общее количество вопросов) × 100
 */
export function calculateMatch(
  answers1: number[], 
  answers2: number[]
): number {
  // Если массивы пустые — совпадений 0
  if (answers1.length === 0 || answers2.length === 0) return 0;
  
  // Считаем количество совпавших ответов
  let matches = 0;
  const totalQuestions = Math.min(answers1.length, answers2.length);
  
  for (let i = 0; i < totalQuestions; i++) {
    // Если ответы на i-й вопрос совпали — увеличиваем счётчик
    if (answers1[i] === answers2[i]) {
      matches++;
    }
  }
  
  // Считаем процент и округляем до целого числа
  return Math.round((matches / totalQuestions) * 100);
}

/**
 * Сохранение контактных данных (лид)
 */
export function saveLeadData(sessionId: string, leadData: LeadData): void {
  const session = getSession(sessionId);
  if (!session) return;
  
  session.leadData = leadData;
  saveSession(session);
}

/**
 * Получение UTM-меток из URL
 * 
 * UTM-метки — это параметры в ссылке, которые показывают,
 * откуда пришёл пользователь (реклама, соцсети и т.д.)
 * Пример: ?utm_source=telegram
 */
function getUtmSource(): string {
  // Читаем параметры из адресной строки
  const params = new URLSearchParams(window.location.search);
  return params.get('utm_source') || 'direct'; // "direct" = пришёл напрямую
}

/**
 * Подготовка данных для отправки в Google Sheets / CRM
 * 
 * Собирает все данные сессии в удобный формат для отправки
 */
export function prepareDataForExport(session: Session) {
  return {
    session_id: session.id,
    created_at: session.createdAt,
    player1_answers: session.player1Answers.join(', '),
    player2_answers: session.player2Answers.join(', '),
    match_percent: session.matchPercent,
    lead_name: session.leadData?.name || '',
    lead_email: session.leadData?.email || '',
    lead_telegram: session.leadData?.telegram || '',
    utm_source: session.utmSource,
  };
}
