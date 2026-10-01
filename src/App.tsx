/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { JarvisChat } from './components/JarvisChat';
import { SmartThingsPanel } from './components/SmartThingsPanel';
import { CalendarRoutinePanel } from './components/CalendarRoutinePanel';
import { FinanceMentorPanel } from './components/FinanceMentorPanel';
import { SpiritualPanel } from './components/SpiritualPanel';
import { TechCoursesPanel } from './components/TechCoursesPanel';
import { WeeklyReportPanel } from './components/WeeklyReportPanel';
import { GmailPanel } from './components/GmailPanel';
import { CalmProtocolModal } from './components/CalmProtocolModal';
import { DailyBriefingModal } from './components/DailyBriefingModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';

import {
  SmartDevice,
  TaskItem,
  CalendarEvent,
  FinancialTransaction,
  FinancialGoal,
  TechCourse,
  GamificationState
} from './types';

import {
  getStoredData,
  setStoredData,
  STORAGE_KEYS,
  INITIAL_DEVICES,
  INITIAL_TASKS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_FINANCES,
  INITIAL_FINANCIAL_GOALS,
  INITIAL_GAMIFICATION,
  ARC_LEVELS
} from './utils/storage';

import { playChime, playJarvisBeep } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('hud');

  // Core state persisted in localStorage
  const [smartDevices, setSmartDevices] = useState<SmartDevice[]>(() =>
    getStoredData(STORAGE_KEYS.SMART_DEVICES, INITIAL_DEVICES)
  );

  const [smartThingsToken, setSmartThingsToken] = useState<string>(() =>
    getStoredData(STORAGE_KEYS.SMARTTHINGS_TOKEN, '')
  );

  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    getStoredData(STORAGE_KEYS.TASKS, INITIAL_TASKS)
  );

  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    getStoredData(STORAGE_KEYS.CALENDAR_EVENTS, INITIAL_CALENDAR_EVENTS)
  );

  const [finances, setFinances] = useState<FinancialTransaction[]>(() =>
    getStoredData(STORAGE_KEYS.FINANCES, INITIAL_FINANCES)
  );

  const [goals] = useState<FinancialGoal[]>(() =>
    getStoredData(STORAGE_KEYS.FINANCIAL_GOALS, INITIAL_FINANCIAL_GOALS)
  );

  const [courses, setCourses] = useState<TechCourse[]>(() =>
    getStoredData(STORAGE_KEYS.TECH_COURSES, [])
  );

  const [gamification, setGamification] = useState<GamificationState>(() =>
    getStoredData(STORAGE_KEYS.GAMIFICATION, INITIAL_GAMIFICATION)
  );

  // Modals state
  const [isCalmOpen, setIsCalmOpen] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [xpToast, setXpToast] = useState<{ amount: number; reason: string } | null>(null);

  // Fetch courses from server on initial load
  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        if (data.courses && data.courses.length > 0) {
          // Merge with any existing user statuses
          setCourses((prev) => {
            if (prev.length === 0) {
              setStoredData(STORAGE_KEYS.TECH_COURSES, data.courses);
              return data.courses;
            }
            return prev;
          });
        }
      })
      .catch((e) => console.log('Loaded local courses fallback', e));
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    setStoredData(STORAGE_KEYS.SMART_DEVICES, smartDevices);
  }, [smartDevices]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.CALENDAR_EVENTS, events);
  }, [events]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.FINANCES, finances);
  }, [finances]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.TECH_COURSES, courses);
  }, [courses]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.GAMIFICATION, gamification);
  }, [gamification]);

  // Gamification: Add XP and check for level upgrades
  const handleAddXp = (amount: number, reason: string) => {
    setGamification((prev) => {
      const newXp = prev.xp + amount;
      // Find matching level
      const matchingLevel =
        ARC_LEVELS.slice()
          .reverse()
          .find((l) => newXp >= l.minXp) || ARC_LEVELS[0];

      const hasLeveledUp = matchingLevel.level > prev.level;

      if (hasLeveledUp) {
        playChime();
      }

      return {
        ...prev,
        xp: newXp,
        level: matchingLevel.level,
        levelName: matchingLevel.name
      };
    });

    // Show temporary XP toast
    setXpToast({ amount, reason });
    setTimeout(() => {
      setXpToast(null);
    }, 3500);
  };

  // SmartThings device command executor
  const handleExecuteDeviceCommand = (deviceId: string, command: string, value?: number) => {
    // Send command to server proxy
    fetch('/api/smartthings/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: smartThingsToken,
        deviceId,
        command,
        args: value !== undefined ? [value] : []
      })
    }).catch((err) => console.warn('SmartThings command relay notice:', err));
  };

  const handleUpdateDevice = (updated: SmartDevice) => {
    setSmartDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleSetAllDevices = (newDevices: SmartDevice[]) => {
    setSmartDevices(newDevices);
    setStoredData(STORAGE_KEYS.SMART_DEVICES, newDevices);
  };

  const handleAddDevice = (newDevice: SmartDevice) => {
    setSmartDevices((prev) => {
      const updated = [newDevice, ...prev];
      setStoredData(STORAGE_KEYS.SMART_DEVICES, updated);
      return updated;
    });
  };

  const handleRemoveDevice = (deviceId: string) => {
    setSmartDevices((prev) => {
      const updated = prev.filter((d) => d.id !== deviceId);
      setStoredData(STORAGE_KEYS.SMART_DEVICES, updated);
      return updated;
    });
  };

  const handleSaveToken = (token: string) => {
    setSmartThingsToken(token);
    setStoredData(STORAGE_KEYS.SMARTTHINGS_TOKEN, token);
    playChime();
    handleAddXp(50, 'Configuração da Nuvem SmartThings');
  };

  // Task handlers
  const handleAddTask = (task: TaskItem) => {
    setTasks((prev) => [task, ...prev]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    playJarvisBeep(600, 0.04);
  };

  // Event handlers
  const handleAddEvent = (evt: CalendarEvent) => {
    setEvents((prev) => [evt, ...prev]);
  };

  const handleDeleteEvent = (evtId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== evtId));
    playJarvisBeep(600, 0.04);
  };

  // Finance handlers
  const handleResetFinances = () => {
    setFinances([]);
    setStoredData(STORAGE_KEYS.FINANCES, []);
    playJarvisBeep(520, 0.08);
  };

  const handleDeleteTransaction = (transId: string) => {
    setFinances((prev) => {
      const updated = prev.filter((t) => t.id !== transId);
      setStoredData(STORAGE_KEYS.FINANCES, updated);
      return updated;
    });
    playJarvisBeep(600, 0.04);
  };

  // Course reminder handler: automatically adds both an agenda event and a prioritized task
  const handleAddCourseReminder = (course: TechCourse) => {
    const today = new Date().toISOString().split('T')[0];

    // Add reminder event to calendar
    const newEvent: CalendarEvent = {
      id: `evt-course-${Date.now()}`,
      title: `[Inscrição Curso] ${course.title}`,
      date: course.deadline.includes('2026') ? course.deadline : today,
      startTime: '10:00',
      endTime: '11:00',
      category: 'Estudos',
      priority: 'alta',
      reminderSet: true
    };
    setEvents((prev) => [newEvent, ...prev]);

    // Add task
    const newTask: TaskItem = {
      id: `task-course-${Date.now()}`,
      title: `Realizar inscrição gratuita: ${course.title}`,
      category: 'Estudos Tech',
      priority: 'alta',
      dueDate: course.deadline.includes('2026') ? course.deadline : today,
      completed: false,
      notes: `Plataforma: ${course.provider} | Link: ${course.url}`,
      xpReward: 80
    };
    setTasks((prev) => [newTask, ...prev]);

    // Update course status
    setCourses((prev) =>
      prev.map((c) =>
        c.id === course.id
          ? { ...c, status: 'inscrito', reminderDate: today }
          : c
      )
    );
  };

  const handleUpdateCourseStatus = (courseId: string, status: TechCourse['status']) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status } : c))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 holo-grid flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        gamification={gamification}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCalm={() => setIsCalmOpen(true)}
        onOpenBriefing={() => setIsBriefingOpen(true)}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        isAudioMuted={isAudioMuted}
        setIsAudioMuted={setIsAudioMuted}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'hud' && (
          <JarvisChat
            smartDevices={smartDevices}
            tasks={tasks}
            gamification={gamification}
            onExecuteDeviceCommand={handleExecuteDeviceCommand}
            onOpenCalm={() => setIsCalmOpen(true)}
            onOpenBriefing={() => setIsBriefingOpen(true)}
            onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === 'smartthings' && (
          <SmartThingsPanel
            devices={smartDevices}
            smartThingsToken={smartThingsToken}
            onSaveToken={handleSaveToken}
            onUpdateDevice={handleUpdateDevice}
            onExecuteCommand={handleExecuteDeviceCommand}
            onAddXp={handleAddXp}
            onSetAllDevices={handleSetAllDevices}
            onAddDevice={handleAddDevice}
            onRemoveDevice={handleRemoveDevice}
          />
        )}

        {activeTab === 'routine' && (
          <CalendarRoutinePanel
            tasks={tasks}
            events={events}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceMentorPanel
            transactions={finances}
            goals={goals}
            onAddTransaction={(trans) => setFinances((prev) => [trans, ...prev])}
            onResetFinances={handleResetFinances}
            onDeleteTransaction={handleDeleteTransaction}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === 'spiritual' && (
          <SpiritualPanel onAddXp={handleAddXp} />
        )}

        {activeTab === 'emails' && (
          <GmailPanel onAddXp={handleAddXp} />
        )}

        {activeTab === 'courses' && (
          <TechCoursesPanel
            courses={courses}
            onAddCourseReminder={handleAddCourseReminder}
            onUpdateCourseStatus={handleUpdateCourseStatus}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === 'report' && (
          <WeeklyReportPanel
            gamification={gamification}
            tasks={tasks}
            transactions={finances}
            onAddXp={handleAddXp}
          />
        )}
      </main>

      {/* Modals */}
      <CalmProtocolModal
        isOpen={isCalmOpen}
        onClose={() => setIsCalmOpen(false)}
        onAddXp={handleAddXp}
      />

      <DailyBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
        onAddXp={handleAddXp}
      />

      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        onAddXp={handleAddXp}
      />

      {/* Floating XP Toast */}
      {xpToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-cyan-400 text-xs font-tech shadow-[0_0_25px_rgba(6,182,212,0.4)] animate-bounce">
          <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center font-hud font-bold text-cyan-300">
            +{xpToast.amount}
          </div>
          <div>
            <span className="text-[10px] text-cyan-400 font-hud uppercase block">
              XP Reator Arc Ganho!
            </span>
            <span className="text-slate-200">{xpToast.reason}</span>
          </div>
        </div>
      )}
    </div>
  );
}
