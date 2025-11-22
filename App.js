import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [decision, setDecision] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [allAnswers, setAllAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [completedDecisions, setCompletedDecisions] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    analytics: true,
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    try {
      const savedDecisions = localStorage.getItem('completedDecisions');
      if (savedDecisions) setCompletedDecisions(JSON.parse(savedDecisions));
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));
      const saved = localStorage.getItem('decisionData');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.decision && data.decision.trim().length >= 10) {
          if (window.confirm('Möchtest du deine letzte Analyse fortsetzen?')) {
            setDecision(data.decision || '');
            setAllAnswers(data.answers || {});
            setCurrentStep(data.step || 0);
            setShowResults(data.showResults || false);
            setHasStarted(true);
          }
        }
      }
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  useEffect(() => {
    if (decision.trim().length >= 10) saveData();
  }, [decision, allAnswers, currentStep, showResults]);

  const saveData = () => {
    try {
      localStorage.setItem('decisionData', JSON.stringify({
        decision, answers: allAnswers, step: currentStep, showResults,
      }));
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const steps = [
    { title: 'Deine erste Intuition', question: 'Was ist dein spontanes Bauchgefühl?', options: ['Stark dafür', 'Eher dafür', 'Neutral', 'Eher dagegen', 'Stark dagegen'], emoji: '🎯' },
    { title: 'Was steht auf dem Spiel?', question: 'Was könntest du verlieren?', type: 'text', followUp: 'Wie hoch ist das Risiko?', followUpOptions: ['Sehr niedrig', 'Niedrig', 'Mittel', 'Hoch', 'Sehr hoch'], emoji: '⚖️' },
    { title: 'Kannst du zurück?', question: 'Wie leicht kannst du diese Entscheidung rückgängig machen?', type: 'text', followUp: 'Wie reversibel?', followUpOptions: ['Vollständig', 'Größtenteils', 'Teilweise', 'Kaum', 'Irreversibel'], emoji: '↩️' },
    { title: 'Zeitperspektive', question: 'Wie siehst du es langfristig?', type: 'text', followUp: 'Überwiegt der Nutzen?', followUpOptions: ['Ja eindeutig', 'Eher ja', 'Unentschieden', 'Eher nein', 'Nein'], emoji: '🔮' },
    { title: 'Äußere Einflüsse', question: 'Was beeinflusst dich?', type: 'text', followUp: 'Kannst du objektiver sein?', followUpOptions: ['Ja definitiv', 'Wahrscheinlich', 'Unsicher', 'Eher nein', 'Nein'], emoji: '🎭' },
    { title: 'Rat an einen Freund', question: 'Was würdest du einem Freund raten?', type: 'text', followUp: 'Deine Empfehlung?', followUpOptions: ['Klar dafür', 'Eher dafür', 'Abwarten', 'Eher dagegen', 'Klar dagegen'], emoji: '💭' },
  ];

  const updateAnswer = (key, value) => {
    setAllAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleOptionClick = (option) => {
    updateAnswer(`step${currentStep}_rating`, option);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateDecision = () => {
    const ratings = {
      step0_rating: { 'Stark dafür': 2, 'Eher dafür': 1, 'Neutral': 0, 'Eher dagegen': -1, 'Stark dagegen': -2 },
      step1_rating: { 'Sehr niedrig': 4, 'Niedrig': 2, 'Mittel': 0, 'Hoch': -2, 'Sehr hoch': -4 },
      step2_rating: { 'Vollständig': 4, 'Größtenteils': 3, 'Teilweise': 1, 'Kaum': -1, 'Irreversibel': -2 },
      step3_rating: { 'Ja eindeutig': 4, 'Eher ja': 2, 'Unentschieden': 0, 'Eher nein': -2, 'Nein': -4 },
      step4_rating: { 'Ja definitiv': 2, 'Wahrscheinlich': 1, 'Unsicher': 0, 'Eher nein': -1, 'Nein': -2 },
      step5_rating: { 'Klar dafür': 6, 'Eher dafür': 3, 'Abwarten': 0, 'Eher dagegen': -3, 'Klar dagegen': -6 },
    };
    let score = 0;
    Object.keys(ratings).forEach(key => {
      const rating = allAnswers[key];
      if (rating && ratings[key][rating] !== undefined) {
        score += ratings[key][rating];
      }
    });
    const percentage = Math.round(((score + 22) / 44) * 100);
    const recommendation = percentage >= 55 ? 'JA' : percentage <= 45 ? 'NEIN' : 'UNENTSCHIEDEN';
    return { percentage, recommendation };
  };

  const reset = () => {
    const result = calculateDecision();
    const newDecision = { id: Date.now(), date: new Date().toISOString(), decision, recommendation: result.recommendation, percentage: result.percentage };
    const updated = [...completedDecisions, newDecision];
    setCompletedDecisions(updated);
    localStorage.setItem('completedDecisions', JSON.stringify(updated));
    setDecision('');
    setCurrentStep(0);
    setAllAnswers({});
    setShowResults(false);
    setHasStarted(false);
    localStorage.removeItem('decisionData');
  };

  const getCurrentStreak = () => {
    if (completedDecisions.length === 0) return 0;
    const dates = [...new Set(completedDecisions.map(d => new Date(d.date).toDateString()))].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      if (dates.includes(checkDate.toDateString())) streak++;
      else break;
    }
    return streak;
  };

  const changeMonth = (dir) => {
    if (dir === 'next') {
      if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
      else setCurrentMonth(currentMonth + 1);
    } else {
      if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
      else setCurrentMonth(currentMonth - 1);
    }
  };

  const TabBar = () => (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-lg border-t border-neutral-200 flex shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
      {[
        { icon: '🧠', label: 'Assistent', index: 0 },
        { icon: '📊', label: 'Tracker', index: 1 },
        { icon: '👥', label: 'Teilen', index: 2 },
        { icon: '⚙️', label: 'Settings', index: 3 },
      ].map(tab => (
        <button
          key={tab.index}
          className={`flex-1 flex flex-col items-center justify-center transition-all active:scale-95 ${
            activeTab === tab.index ? 'text-blue-500' : 'text-neutral-400'
          }`}
          onClick={() => setActiveTab(tab.index)}
        >
          <span className={`text-2xl mb-1 transition-all ${activeTab === tab.index ? 'drop-shadow-[0_0_8px_rgba(79,128,255,0.4)]' : ''}`}>
            {tab.icon}
          </span>
          <span className="text-xs font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );

  if (activeTab === 1) {
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Montag = 0, Sonntag = 6
    const decisionDates = new Set(completedDecisions.map(d => new Date(d.date).toDateString()));
    
    // Leere Zellen am Anfang für korrekte Wochentag-Ausrichtung
    const emptyDays = Array.from({ length: firstDayIndex }, (_, i) => ({ isEmpty: true, key: `empty-${i}` }));
    
    // Tage des Monats
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(currentYear, currentMonth, i + 1);
      return { day: i + 1, hasDecision: decisionDates.has(date.toDateString()), isEmpty: false };
    });
    
    const allDays = [...emptyDays, ...days];

    return (
      <div className="min-h-screen bg-neutral-50 pb-24">
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-gradient-to-br from-white to-neutral-50 rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] mb-6">
            <h1 className="text-3xl font-bold text-neutral-800 mb-8">📊 Dein Fortschritt</h1>
            <div className="grid grid-cols-2 gap-5 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 text-center shadow-[0_2px_12px_rgba(79,128,255,0.1)]">
                <div className="text-4xl font-bold text-blue-500 mb-2">{completedDecisions.length}</div>
                <div className="text-sm text-neutral-600 font-medium">Entscheidungen</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 text-center shadow-[0_2px_12px_rgba(70,191,122,0.1)]">
                <div className="text-4xl font-bold text-green-500 mb-2">{getCurrentStreak()}</div>
                <div className="text-sm text-neutral-600 font-medium">Tage Streak 🔥</div>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => changeMonth('prev')} className="px-5 py-3 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all active:scale-95 font-semibold text-neutral-700">←</button>
              <span className="font-bold text-lg text-neutral-800">{monthNames[currentMonth]} {currentYear}</span>
              <button onClick={() => changeMonth('next')} className="px-5 py-3 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all active:scale-95 font-semibold text-neutral-700">→</button>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-3">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-bold text-neutral-400 pb-1">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {allDays.map((d, idx) => (
                d.isEmpty ? (
                  <div key={d.key} className="aspect-square"></div>
                ) : (
                  <div
                    key={d.day}
                    className={`aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all hover:scale-105 cursor-pointer ${
                      d.hasDecision ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-[0_2px_8px_rgba(70,191,122,0.3)]' : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {d.day}
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
        <TabBar />
      </div>
    );
  }

  if (activeTab === 2) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-24">
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-gradient-to-br from-white to-neutral-50 rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
            <h1 className="text-3xl font-bold text-neutral-800 mb-6">👥 App teilen</h1>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl mb-6 border border-blue-100">
              <h2 className="font-bold text-lg text-neutral-800 mb-2">Hilf anderen bessere Entscheidungen zu treffen</h2>
              <p className="text-sm text-neutral-600 leading-relaxed">Teile diese App mit Freunden und Familie.</p>
            </div>
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-5 rounded-2xl font-bold text-lg shadow-[0_4px_16px_rgba(79,128,255,0.3)] hover:shadow-[0_6px_20px_rgba(79,128,255,0.4)] hover:scale-[1.02] transition-all active:scale-95">
              📤 App teilen
            </button>
          </div>
        </div>
        <TabBar />
      </div>
    );
  }

  if (activeTab === 3) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-24">
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-gradient-to-br from-white to-neutral-50 rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-neutral-800">Einstellungen</h1>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xs font-bold text-neutral-400 mb-4 tracking-wider">PERSONALISIERUNG</h3>
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
                {['Gewohnheitsmanager', 'Widget-Thema', 'Thema', 'Seite & Funktion'].map((item, i) => (
                  <button key={i} className="w-full flex justify-between items-center p-5 hover:bg-neutral-50 transition-all active:scale-[0.99] border-b border-neutral-100 last:border-0">
                    <span className="font-medium text-neutral-700">{item}</span>
                    <span className="text-neutral-300">→</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xs font-bold text-neutral-400 mb-4 tracking-wider">SYNCHRONISATION</h3>
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-neutral-100">
                  <span className="font-medium text-neutral-700">Google Drive Sync</span>
                  <span className="text-sm text-neutral-400">Deaktiviert</span>
                </div>
                <button className="w-full flex justify-between items-center p-5 hover:bg-neutral-50 transition-all active:scale-[0.99]">
                  <span className="font-medium text-neutral-700">Benachrichtigungen</span>
                  <span className="text-neutral-300">→</span>
                </button>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xs font-bold text-neutral-400 mb-4 tracking-wider">ÜBER</h3>
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
                {[
                  'Tipps für die Nutzung',
                  'Häufig Gestellte Fragen',
                  'Kontaktieren Sie uns',
                  'Instagram: lightbyte_apps',
                  'Teilen',
                  { text: 'Bewerten und unterstützen', badge: 'V 1.0.0' }
                ].map((item, i) => (
                  <button key={i} className="w-full flex justify-between items-center p-5 hover:bg-neutral-50 transition-all active:scale-[0.99] border-b border-neutral-100 last:border-0">
                    <span className="font-medium text-neutral-700">{typeof item === 'string' ? item : item.text}</span>
                    <span className="text-neutral-300">{typeof item === 'string' ? '→' : item.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xs font-bold text-neutral-400 mb-4 tracking-wider">DATEN</h3>
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
                <button
                  onClick={() => {
                    const data = { completedDecisions, settings, date: new Date().toISOString() };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'entscheidungen-backup.json';
                    a.click();
                  }}
                  className="w-full flex justify-between items-center p-5 hover:bg-neutral-50 transition-all active:scale-[0.99] border-b border-neutral-100"
                >
                  <span className="font-medium text-neutral-700">Daten exportieren</span>
                  <span>📥</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Möchtest du wirklich alle Daten löschen?')) {
                      localStorage.clear();
                      setCompletedDecisions([]);
                      setDecision('');
                      setAllAnswers({});
                      setCurrentStep(0);
                      setShowResults(false);
                      setHasStarted(false);
                      alert('Alle Daten wurden gelöscht.');
                    }
                  }}
                  className="w-full flex justify-between items-center p-5 hover:bg-red-50 transition-all active:scale-[0.99] text-red-500"
                >
                  <span className="font-medium">Alle Daten löschen</span>
                  <span>🗑️</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <TabBar />
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/30 to-neutral-50 pb-24">
        <div className="max-w-2xl mx-auto p-6 pt-12">
          <div className="text-center mb-8 animate-[fadeIn_0.6s_ease-out]">
            <div className="text-7xl mb-4">🧠</div>
            <h1 className="text-4xl font-bold text-neutral-800 mb-3">Entscheidungs-Assistent</h1>
            <p className="text-neutral-600 text-lg">Treffe heute eine bessere Entscheidung – in 6 klaren Schritten.</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] animate-[slideUp_0.6s_ease-out]">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-6 rounded-2xl mb-6 border border-blue-100">
              <p className="text-sm text-neutral-700 leading-relaxed">Diese App führt dich durch 6 wissenschaftlich fundierte Schritte für durchdachte Entscheidungen.</p>
            </div>
            <label className="block mb-3 font-bold text-neutral-800">Beschreibe deine Entscheidung:</label>
            <textarea
              className="w-full border-2 border-neutral-200 focus:border-blue-400 rounded-2xl p-4 text-base resize-none transition-all focus:outline-none focus:shadow-[0_0_0_4px_rgba(79,128,255,0.1)]"
              rows={4}
              value={decision}
              onChange={(e) => e.target.value.length <= 500 && setDecision(e.target.value)}
              placeholder="z.B. Soll ich ein neues Auto kaufen?"
            />
            <div className="flex justify-between text-sm mt-3 mb-6">
              <span className={decision.trim().length >= 10 ? 'text-green-500 font-semibold' : 'text-neutral-400'}>
                {decision.trim().length >= 10 ? '✓ Perfekt!' : `Noch ${10 - decision.trim().length} Zeichen`}
              </span>
              <span className="text-neutral-400">{decision.length}/500</span>
            </div>
            <button
              className={`w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-lg ${
                decision.trim().length >= 10
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-[0_6px_20px_rgba(79,128,255,0.4)] hover:scale-[1.02] active:scale-95'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
              onClick={() => decision.trim().length >= 10 && setHasStarted(true)}
            >
              {decision.trim().length >= 10 ? 'Analyse starten 🚀' : 'Beschreibe deine Entscheidung'}
            </button>
          </div>
        </div>
        <TabBar />
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  if (showResults) {
    const result = calculateDecision();
    const isPositive = result.recommendation === 'JA';
    const isNegative = result.recommendation === 'NEIN';
    const color = isPositive ? 'from-green-400 to-green-500' : isNegative ? 'from-red-400 to-red-500' : 'from-yellow-400 to-yellow-500';
    const message = isPositive
      ? 'Dieser Weg könnte der richtige sein – du triffst durchdachte Entscheidungen! 🎉'
      : isNegative
      ? 'Die Analyse rät zur Vorsicht. Überlege es dir nochmal. 🤔'
      : 'Die Signale sind gemischt. Sammle mehr Informationen. 🔍';

    return (
      <div className="min-h-screen bg-neutral-50 pb-24">
        <div className="max-w-2xl mx-auto p-6 pt-8">
          <div className="bg-white rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] mb-6 animate-[popIn_0.5s_ease-out]">
            <h1 className="text-3xl font-bold text-neutral-800 mb-6">✨ Deine Analyse</h1>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-2xl mb-6 border border-blue-100">
              <p className="text-sm text-neutral-700 font-medium">{decision}</p>
            </div>
            <div className={`bg-gradient-to-br ${color} text-white rounded-3xl p-8 text-center mb-6 shadow-[0_8px_24px_rgba(0,0,0,0.15)] animate-[bounceIn_0.6s_ease-out]`}>
              <div className="text-7xl mb-4 animate-[wiggle_1s_ease-in-out]">
                {isPositive ? '👍' : isNegative ? '👎' : '⚠️'}
              </div>
              <h2 className="text-5xl font-bold mb-3">{result.recommendation}</h2>
              <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-4">
                <p className="text-xl font-semibold">Konfidenz: {result.percentage}%</p>
              </div>
              <p className="text-base leading-relaxed opacity-95">{message}</p>
            </div>
            <button
              onClick={reset}
              className="w-full bg-gradient-to-r from-neutral-700 to-neutral-800 text-white py-5 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95"
            >
              Neue Entscheidung analysieren 🔄
            </button>
          </div>
        </div>
        <TabBar />
        <style>{`
          @keyframes popIn {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes bounceIn {
            0% { opacity: 0; transform: scale(0.8) translateY(20px); }
            60% { transform: scale(1.05) translateY(-5px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-10deg); }
            75% { transform: rotate(10deg); }
          }
        `}</style>
      </div>
    );
  }

  const step = steps[currentStep];
  const textValue = allAnswers[`step${currentStep}_text`] || '';
  const hasText = step.type === 'text' ? textValue.trim().length >= 0 : true;

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      <div className="max-w-2xl mx-auto p-6 pt-8">
        <div className="bg-white rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-bold text-blue-500">
                Schritt {currentStep + 1} von {steps.length}
              </p>
              <span className="text-3xl">{step.emoji}</span>
            </div>
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                    i <= currentStep ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-neutral-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-2xl mb-6 border border-blue-100">
            <p className="text-sm text-neutral-700 font-medium">{decision}</p>
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 mb-3">{step.title}</h2>
          <p className="text-neutral-600 mb-6 text-lg">{step.question}</p>
          {step.type === 'text' ? (
            <>
              <textarea
                className="w-full border-2 border-neutral-200 focus:border-blue-400 rounded-2xl p-4 text-base resize-none mb-4 transition-all focus:outline-none focus:shadow-[0_0_0_4px_rgba(79,128,255,0.1)]"
                rows={4}
                value={textValue}
                onChange={(e) => updateAnswer(`step${currentStep}_text`, e.target.value)}
                placeholder="Deine Gedanken..."
              />
              {step.followUp && (
                <div className="bg-neutral-50 p-6 rounded-2xl">
                  <p className="font-bold text-neutral-800 mb-4">{step.followUp}</p>
                  <div className="space-y-3">
                    {step.followUpOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleOptionClick(opt)}
                        className="w-full p-4 bg-white border-2 border-neutral-200 hover:border-blue-400 rounded-xl text-left font-medium text-neutral-700 transition-all hover:shadow-[0_2px_12px_rgba(79,128,255,0.15)] hover:scale-[1.01] active:scale-[0.99]"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              {step.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  className="w-full p-4 bg-white border-2 border-neutral-200 hover:border-blue-400 rounded-xl text-left font-medium text-neutral-700 transition-all hover:shadow-[0_2px_12px_rgba(79,128,255,0.15)] hover:scale-[1.01] active:scale-[0.99]"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="mt-6 text-neutral-500 hover:text-neutral-700 font-medium transition-all"
            >
              ← Zurück
            </button>
          )}
        </div>
      </div>
      <TabBar />
    </div>
  );
}