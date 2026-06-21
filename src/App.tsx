/**
 * ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ (App)
 * 
 * Это "мозг" всего лендинга. Он управляет:
 * - Навигацией между экранами (какой экран показывать)
 * - Состоянием сессии (данные теста)
 * - Логикой теста (создание сессии, сохранение ответов, подсчёт результата)
 * 
 * ЭКРАНЫ ПРИЛОЖЕНИЯ (в порядке прохождения):
 * 1. hero        — Первый экран с заголовком и кнопкой "Начать"
 * 2. howItWorks  — Экран "Как это работает" (3 шага)
 * 3. invite      — Приглашение партнёра (ссылка для второго участника)
 * 4. quiz        — Тест с вопросами (7 вопросов с таймером)
 * 5. waiting     — Ожидание второго участника
 * 6. result      — Результат (процент совпадения)
 * 7. share       — Шеринг результата в соцсетях
 * 8. leadForm    — Форма сбора контактов
 * 9. success     — Успешная отправка формы
 */

import React, { useState, useEffect, useCallback } from 'react';

// Импортируем все экраны (компоненты)
import HeroScreen from './components/HeroScreen';
import HowItWorksScreen from './components/HowItWorksScreen';
import InviteScreen from './components/InviteScreen';
import QuizScreen from './components/QuizScreen';
import WaitingScreen from './components/WaitingScreen';
import ResultScreen from './components/ResultScreen';
import ShareScreen from './components/ShareScreen';
import LeadFormScreen from './components/LeadFormScreen';
import SuccessScreen from './components/SuccessScreen';

// Импортируем функции для работы с сессиями
import { 
  createSession, 
  getSession, 
  saveAnswers, 
  saveLeadData,
  Session,
  LeadData
} from './utils/session';

// Импортируем функцию экспорта в Excel
import { exportSessionToExcel } from './utils/exportExcel';

// Импортируем функцию отправки в Google Sheets
import { sendToGoogleSheets } from './utils/googleSheets';

// Все возможные экраны приложения
type Screen = 
  | 'hero' 
  | 'howItWorks' 
  | 'invite' 
  | 'quiz' 
  | 'waiting' 
  | 'result' 
  | 'share' 
  | 'leadForm' 
  | 'success';

const App: React.FC = () => {
  // === ОСНОВНЫЕ СОСТОЯНИЯ ===
  
  // Текущий экран (какой показываем)
  const [screen, setScreen] = useState<Screen>('hero');
  
  // Данные текущей сессии
  const [session, setSession] = useState<Session | null>(null);
  
  // Номер участника: 1 = тот, кто создал тест, 2 = тот, кто пришёл по ссылке
  const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);
  
  // Способ связи (для экрана успеха)
  const [contactMethod, setContactMethod] = useState<'email' | 'telegram'>('telegram');
  
  // Флаг: была ли форма уже отправлена (защита от повторной отправки)
  const [formSubmitted, setFormSubmitted] = useState(false);

  /**
   * ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
   * 
   * Проверяем URL на наличие параметров:
   * - session — ID сессии (если перешли по ссылке)
   * - player — номер участника (2 = второй участник)
   * 
   * Это нужно для того, чтобы второй участник попал в ту же сессию.
   */
  useEffect(() => {
    // Читаем параметры из URL
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session');
    const player = params.get('player');
    
    if (sessionId && player === '2') {
      // Если в URL есть session и player=2 — значит это второй участник
      const existingSession = getSession(sessionId);
      
      if (existingSession) {
        // Нашли сессию — загружаем её
        setSession(existingSession);
        setPlayerNumber(2);
        
        if (existingSession.player2Completed) {
          // Если второй уже прошёл — проверяем результат
          if (existingSession.player1Completed && existingSession.matchPercent !== null) {
            setScreen('result');
          } else {
            setScreen('waiting');
          }
        } else {
          // Второй ещё не проходил — начинаем тест
          setScreen('quiz');
        }
      } else {
        // Сессия не найдена — показываем главную
        setScreen('hero');
      }
      
      // Очищаем URL (убираем параметры) — чтобы при обновлении не было проблем
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    // Проверяем, была ли форма уже отправлена (для этой сессии)
    const submitted = localStorage.getItem('yogurt_form_submitted');
    if (submitted) {
      setFormSubmitted(true);
    }
  }, []);

  /**
   * ОБРАБОТЧИК: Нажатие "Начать тест" на Hero-экране
   * Переводит пользователя на экран "Как это работает"
   */
  const handleStartFromHero = useCallback(() => {
    setScreen('howItWorks');
  }, []);

  /**
   * ОБРАБОТЧИК: Нажатие "Начать" на экране "Как это работает"
   * Создаёт новую сессию и переводит на экран приглашения
   */
    const handleStartTest = useCallback(() => {
        // ✅ Метрика — начало теста
        if (typeof window !== 'undefined' && (window as any).ym) {
            (window as any).ym(110044295, 'reachGoal', 'start_test');
        }

        const newSession = createSession();
        setSession(newSession);
        setPlayerNumber(1);
        setScreen('invite');
    }, []);

  /**
   * ОБРАБОТЧИК: Переход к тесту (после приглашения)
   * Пользователь нажал "Пройти тест первым"
   */
  const handleProceedToQuiz = useCallback(() => {
    setScreen('quiz');
  }, []);

  /**
   * ОБРАБОТЧИК: Завершение теста
   * Вызывается когда пользователь ответил на все вопросы.
   * 
   * @param answers — массив ответов пользователя
   */
  const handleQuizComplete = useCallback((answers: number[]) => {
      if (!session) return;

      // ✅ Метрика — завершение теста
      if (typeof window !== 'undefined' && (window as any).ym) {
          (window as any).ym(110044295, 'reachGoal', 'finish_test');
      }
    
    // Сохраняем ответы в сессию
    const updatedSession = saveAnswers(session.id, playerNumber, answers);
    
    if (updatedSession) {
      setSession(updatedSession);
      
      // Проверяем, завершили ли оба участника тест
      if (updatedSession.player1Completed && updatedSession.player2Completed) {
        // Оба завершили — показываем результат
        setScreen('result');
      } else {
        // Ждём второго участника
        setScreen('waiting');
      }
    }
  }, [session, playerNumber]);

  /**
   * ОБРАБОТЧИК: Проверка статуса партнёра
   * Вызывается на экране ожидания — проверяет, прошёл ли партнёр тест.
   * 
   * В демо-версии можно имитировать ответы партнёра для демонстрации.
   */
  const handleCheckPartner = useCallback(() => {
    if (!session) return;
    
    // Перечитываем сессию из localStorage (партнёр мог обновить данные)
    const freshSession = getSession(session.id);
    
    if (freshSession) {
      setSession(freshSession);
      
      if (freshSession.player1Completed && freshSession.player2Completed && freshSession.matchPercent !== null) {
        // Оба завершили — показываем результат!
        setScreen('result');
      } else {
        // Для демонстрации: если партнёр не пришёл, создаём случайные ответы
        // В реальном проекте здесь просто показывалось бы сообщение "Пока ждём"
        simulatePartnerAnswers(freshSession);
      }
    }
  }, [session]);

  /**
   * ИМИТАЦИЯ ОТВЕТОВ ПАРТНЁРА (для демонстрации)
   * 
   * В реальном проекте второй участник отвечал бы на другом устройстве.
   * Для демо мы генерируем случайные ответы, чтобы можно было
   * увидеть результат.
   */
  const simulatePartnerAnswers = useCallback((currentSession: Session) => {
    // Определяем, кого имитировать
    const missingPlayer: 1 | 2 = !currentSession.player1Completed ? 1 : 2;
    
    // Генерируем случайные ответы (7 вопросов, 4 варианта каждый)
    const randomAnswers = Array(7).fill(0).map(() => Math.floor(Math.random() * 4));
    
    // Сохраняем имитированные ответы
    const updatedSession = saveAnswers(currentSession.id, missingPlayer, randomAnswers);
    
    if (updatedSession) {
      setSession(updatedSession);
      
      if (updatedSession.matchPercent !== null) {
        // Показываем результат
        setScreen('result');
      }
    }
  }, []);

  /**
   * ОБРАБОТЧИК: Открыть экран шеринга
   */
  const handleShare = useCallback(() => {
    setScreen('share');
  }, []);

  /**
   * ОБРАБОТЧИК: Открыть форму лидогенерации
   */
  const handleGetChecklist = useCallback(() => {
    if (formSubmitted) {
      // Если форма уже отправлена — показываем экран успеха
      setScreen('success');
    } else {
      setScreen('leadForm');
    }
  }, [formSubmitted]);

  /**
   * ОБРАБОТЧИК: Отправка формы с контактами
   * 
   * При отправке формы:
   * 1. Сохраняем данные в localStorage
   * 2. Отправляем данные в Google Sheets (если настроено)
   * 3. Локально сохраняем в Excel (как резервная копия)
   * 4. Показываем экран успеха
   */
  const handleLeadSubmit = useCallback((data: LeadData) => {
      if (!session) return;

      // ✅ Метрика — отправка формы
      if (typeof window !== 'undefined' && (window as any).ym) {
          (window as any).ym(110044295, 'reachGoal', 'lead_submitted');
      }
    
    // Сохраняем данные лида в сессию (в localStorage браузера)
    saveLeadData(session.id, data);
    
    // Определяем способ связи (для экрана успеха)
    setContactMethod(data.telegram ? 'telegram' : 'email');
    
    // Помечаем форму как отправленную (защита от повторной отправки)
    setFormSubmitted(true);
    localStorage.setItem('yogurt_form_submitted', 'true');
    
    // Получаем обновлённую сессию с данными лида
    const updatedSession = getSession(session.id);
    if (updatedSession) {
      // 1. Отправляем данные в Google Sheets (основное хранилище)
      sendToGoogleSheets(updatedSession);
      
      // 2. Локально сохраняем Excel-файл (резервная копия)
      exportSessionToExcel(updatedSession);
    }
    
    // Переходим на экран успеха
    setScreen('success');
    
    console.log('📊 Данные лида сохранены:', data);
  }, [session]);

  /**
   * ОБРАБОТЧИК: Начать тест заново
   * Сбрасывает все данные и возвращает на главную
   */
  const handleRestart = useCallback(() => {
    setSession(null);
    setPlayerNumber(1);
    setFormSubmitted(false);
    setScreen('hero');
    // Удаляем флаг отправки формы
    localStorage.removeItem('yogurt_form_submitted');
  }, []);

  // === РЕНДЕРИНГ ===
  // Показываем нужный экран в зависимости от состояния

  return (
    /* Главный контейнер — на весь экран, минимальная высота 100vh */
    <div className="min-h-screen bg-amber-50">
      
      {/* Условный рендеринг — показываем только один экран */}
      
      {/* 1. Главный экран (Hero) */}
      {screen === 'hero' && (
        <HeroScreen onStart={handleStartFromHero} />
      )}
      
      {/* 2. Как это работает */}
      {screen === 'howItWorks' && (
        <HowItWorksScreen onStart={handleStartTest} />
      )}
      
      {/* 3. Приглашение партнёра */}
      {screen === 'invite' && session && (
        <InviteScreen 
          sessionId={session.id}
          onProceed={handleProceedToQuiz}
        />
      )}
      
      {/* 4. Тест (вопросы) */}
      {screen === 'quiz' && (
        <QuizScreen onComplete={handleQuizComplete} />
      )}
      
      {/* 5. Ожидание партнёра */}
      {screen === 'waiting' && session && (
        <WaitingScreen 
          sessionId={session.id}
          onCheck={handleCheckPartner}
          isPlayer1Done={session.player1Completed}
          isPlayer2Done={session.player2Completed}
        />
      )}
      
      {/* 6. Результат */}
      {screen === 'result' && session && session.matchPercent !== null && (
        <ResultScreen 
          matchPercent={session.matchPercent}
          onShare={handleShare}
          onGetChecklist={handleGetChecklist}
        />
      )}
      
      {/* 7. Шеринг */}
      {screen === 'share' && session && session.matchPercent !== null && (
        <ShareScreen 
          matchPercent={session.matchPercent}
          onBack={() => setScreen('result')}
        />
      )}
      
      {/* 8. Форма сбора контактов */}
      {screen === 'leadForm' && (
        <LeadFormScreen 
          onSubmit={handleLeadSubmit}
          onBack={() => setScreen('result')}
        />
      )}
      
      {/* 9. Успешная отправка */}
      {screen === 'success' && (
        <SuccessScreen 
          contactMethod={contactMethod}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

export default App;
