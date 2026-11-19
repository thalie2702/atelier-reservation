
import { useState, useEffect } from 'react';
import './App.css';

type MakeupCredit = {
  id: string;
  absenceDate: string;
  reason: 'personal' | 'medical';
  expiresAt: string;
  status: 'available' | 'used' | 'expired';
};
type AtelierEvent = {
  date: string;
  place: string;
};
function App() {

  const [date, setDate] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState(2);
  const [place, setPlace] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
const [newEventPlace, setNewEventPlace] = useState(
  'イギリス館'
);
  const [morning, setMorning] = useState(false);
　const [afternoon, setAfternoon] = useState(false);

const [calendarMonth, setCalendarMonth] = useState(
  new Date(2026, 10, 1)
);
const [atelierEvents, setAtelierEvents] = useState<AtelierEvent[]>(() => {
  const saved = localStorage.getItem('atelierEvents');

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }

  return [];
});
useEffect(() => {
  localStorage.setItem(
    'atelierEvents',
    JSON.stringify(atelierEvents)
  );
}, [atelierEvents]);
const [eventDates] = useState<string[]>(() => {
  const saved = localStorage.getItem('atelierEventDates');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // 保存データが読めない場合は初期設定を使う
    }
  }
  return ['2026-11-15', '2026-11-29'];
});

useEffect(() => {
  localStorage.setItem(
    'atelierEventDates',
    JSON.stringify(eventDates)
  );
}, [eventDates]);

const year = calendarMonth.getFullYear();
const month = calendarMonth.getMonth();

const firstDay = new Date(year, month, 1).getDay();
const daysInMonth = new Date(year, month + 1, 0).getDate();

const calendarDays = [
  ...Array(firstDay).fill(null),
  ...Array.from(
    { length: daysInMonth },
    (_, i) => i + 1
  ),
];

const selectEventDate = (day: number) => {
  const selectedDate =
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

 
if (
  !eventDates.includes(selectedDate) &&
  !atelierEvents.some((event) => event.date === selectedDate)
) return;


  setDate(selectedDate);

  const registeredEvent = atelierEvents.find(
    (event) => event.date === selectedDate
  );
  
  setPlace(
    registeredEvent?.place ?? '関内ホール・リハーサル室2'
  );
  
setMorning(false);
setAfternoon(false);
};
const addAtelierEvent = () => {
  if (!newEventDate || !newEventPlace) {
    alert('開催日と会場を入力してください');
    return;
  }

  const newEvent: AtelierEvent = {
    date: newEventDate,
    place: newEventPlace,
  };

  setAtelierEvents((prev) => [...prev, newEvent]);
  setNewEventDate('');
  alert('開催日を登録しました');
};
　const count = Number(morning) + Number(afternoon);
　const [makeupCredits, setMakeupCredits] = useState<number>(() => {
  const saved = localStorage.getItem('atelierMakeupCredits');
  return saved === null ? 0 : Number(saved);
});
const [makeupCreditList, setMakeupCreditList] =
  useState<MakeupCredit[]>(() => {
    const saved = localStorage.getItem('atelierMakeupCreditList');

    if (!saved) return [];

    try {
      const data = JSON.parse(saved);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem(
      'atelierMakeupCreditList',
      JSON.stringify(makeupCreditList)
    );
  }, [makeupCreditList]);
useEffect(() => {
  localStorage.setItem(
    'atelierMakeupCredits',
    String(makeupCredits)
  );
}, [makeupCredits]);
　const [absenceReports, setAbsenceReports] = useState<string[]>(() => {
  const saved = localStorage.getItem('atelierAbsenceReports');

  if (!saved) return [];

  try {
    const data = JSON.parse(saved);
    return Array.isArray(data) && data.every(
      (item) => typeof item === 'string'
    ) ? data : [];
  } catch {
    return [];
  }
});
useEffect(() => {
  localStorage.setItem(
    'atelierAbsenceReports',
    JSON.stringify(absenceReports)
  );
}, [absenceReports]);
　
const [reservations, setReservations] = useState<string[]>(() => {

const saved = localStorage.getItem('atelierReservations');

  if (saved) {
    try {
 const data = JSON.parse(saved);
      return Array.isArray(data) && data.every(
        (item) => typeof item === 'string'
      ) ? data : [];
    } catch {
      return [];
    }
  }

  return [];
});

　const selectedMonth = date
  ? date.slice(0, 7)
  : `${year}-${String(month + 1).padStart(2, '0')}`;

const monthlyReserved = reservations.reduce((total, reservation) => {
  if (!reservation.startsWith(selectedMonth + '-')) return total;

  const match = reservation.match(/(\d+)回/);

  return total + (match ? Number(match[1]) : 0);
}, 0);
useEffect(() => {
  localStorage.setItem(
    'atelierReservations',
    JSON.stringify(reservations)
  );
}, [reservations]);
const availableMakeupCredits = makeupCreditList.filter(
  (credit) =>
    credit.status === 'available' &&
    new Date(credit.expiresAt) >= new Date()
);


const totalReserved = reservations.reduce((total, reservation) => {
const match = reservation.match(/（(\d+)回）/);
  return total + (match ? Number(match[1]) : 0);
}, 0);


const cancelReservation = (index: number) => {

  const cancelled = reservations[index];

  setAbsenceReports((prev) => [...prev, cancelled]);

  setReservations((prev) =>
    prev.filter((_, i) => i !== index)
  );
};
const approveMakeup = (index: number) => {
  const reason = window.prompt(
    '欠席理由を選んでください\n1：自己都合（翌月末まで）\n2：病欠・葬儀など（半年以内）'
  );
  
  if (reason !== '1' && reason !== '2') {
    alert('1または2を入力してください');
    return;
  }
  const absence = absenceReports[index];
 
const match = absence.match(/^(\d{4})-(\d{2})-(\d{2})/);

if (!match) {
  alert('欠席日を確認できません');
  return;
}

const absenceDate = new Date(
  Number(match[1]),
  Number(match[2]) - 1,
  Number(match[3])
);
  
  const expiresAt = new Date(absenceDate);
  
  if (reason === '1') {
    expiresAt.setMonth(expiresAt.getMonth() + 2, 0);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 6);
  }
  
  setMakeupCreditList(prev => [
    ...prev,
    {
      id: crypto.randomUUID(),
      absenceDate: absenceDate.toISOString(),
      reason: reason === '1' ? 'personal' : 'medical',
      expiresAt: expiresAt.toISOString(),
      status: 'available',
    },
  ]);
  
  setMakeupCredits(prev => prev + 1);

  setAbsenceReports((prev) =>
    prev.filter((_, i) => i !== index)
  );
};

const addReservation = () => {

  if (!date || count === 0) {
    alert('開催日と受講時間を選んでください');
    return;
  }
  if (
    monthlyReserved + count >
    monthlyLimit + availableMakeupCredits.length
  ) {
    alert('今月の予約可能回数を超えています。');
    return;
  }

  const times = [
    morning ? '午前' : '',
    afternoon ? '午後' : '',
  ].filter(Boolean).join('・');

  const newReservation = `${date} ${times}（${count}回）`;
  const alreadyReserved = reservations.some((reservation) => {
    const sameDate = reservation.startsWith(`${date} `);
  
    if (!sameDate) return false;
  
    const morningDuplicate =
      morning && reservation.includes('午前');
  
    const afternoonDuplicate =
      afternoon && reservation.includes('午後');
  
    return morningDuplicate || afternoonDuplicate;
  });
  
  if (alreadyReserved) {
    alert('選択した時間には、すでに予約があります。');
    return;
  }

  setReservations([...reservations, newReservation]);
  setMorning(false);
  setAfternoon(false);
};

  // 選択した日の午前・午後の予約数
  const morningReserved = reservations.filter(
    (reservation) =>
      reservation.startsWith(`${date} `) &&
      reservation.includes('午前')
  ).length;

  const afternoonReserved = reservations.filter(
    (reservation) =>
      reservation.startsWith(`${date} `) &&
      reservation.includes('午後')
  ).length;

  // 月謝会員の定員は各4名
  const morningRemaining = Math.max(0, 4 - morningReserved);
  const afternoonRemaining = Math.max(0, 4 - afternoonReserved);


  return (
    <div>
      <img
      src="/forest.jpg"
      alt="星がみえる森のアトリエの森"
      className="forest-header"
    />
      <h1>星がみえる森のアトリエ</h1>
      <h2>予約カレンダー</h2>

<div className="calendar">
  <div className="calendar-nav">
    <button onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}>
      ◀ 前月
    </button>
    <strong>{year}年{month + 1}月</strong>
    <button onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}>
      翌月 ▶
    </button>
  </div>

  <div className="calendar-grid">
    {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
      <div key={day} className="weekday">{day}</div>
    ))}

    {calendarDays.map((day, index) => {
      if (day === null) return <div key={index} />;

      const dateString =
        `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      
const isEvent =
eventDates.includes(dateString) ||
atelierEvents.some((event) => event.date === dateString);


      return (
        <button
          key={dateString}
          className={isEvent ? 'event-day' : 'normal-day'}
          disabled={!isEvent}
          onClick={() => selectEventDate(day)}
        >
          {day}
        </button>
      );
    })}
  </div>
</div>

<section className="event-admin">
  <h3>開催日の登録（管理用テスト）</h3>

  <p>開催日</p>
  <input
    type="date"
    value={newEventDate}
    onChange={(e) => setNewEventDate(e.target.value)}
  />

  <p>開催場所</p>
  <select
    value={newEventPlace}
    onChange={(e) => setNewEventPlace(e.target.value)}
  >
    <option value="イギリス館">イギリス館</option>
    <option value="関内ホール・リハーサル室1">
      関内ホール・リハーサル室1
    </option>
    <option value="関内ホール・リハーサル室2">
      関内ホール・リハーサル室2
    </option>
  </select>

  <button type="button" onClick={addAtelierEvent}>
    開催日を登録
  </button>
</section>

      <h3>受講コース</h3>

<select
  value={monthlyLimit}
  onChange={(e) => setMonthlyLimit(Number(e.target.value))}
>
  <option value={1}>月1回コース</option>
  <option value={2}>月2回コース</option>
  <option value={3}>月3回コース</option>
</select>

<p>今月の基本受講回数：{monthlyLimit}回</p>
<p>振替可能回数：{makeupCredits}回</p>




      <p>開催日を選んでください</p>



      <p>選んだ日：{date}</p>
      <p>開催場所：{place}</p>

{date && (
  <div>
    <h3>受講時間を選んでください</h3>

<p>午前の残席：{morningRemaining}席</p>
<p>午後の残席：{afternoonRemaining}席</p>


    <label>
      <input
        type="checkbox"
        checked={morning}
        onChange={(e) => setMorning(e.target.checked)}
      />
      午前 10:00〜12:00
    </label>

    <label>
      <input
        type="checkbox"
        checked={afternoon}
        onChange={(e) => setAfternoon(e.target.checked)}
      />
      午後 14:00〜16:45
    </label>

    <p>今回の受講回数：{count}回</p>

<button onClick={addReservation}>
  予約する
</button>

<h3>わたしの予約一覧</h3>

<p>予約済みの受講回数：{totalReserved}回</p>


{reservations.length === 0 ? (
  <p>まだ予約はありません</p>
) : (
  <ul>
    
{reservations.map((reservation, index) => (
  <li key={index}>
    {reservation}
    <button
      onClick={() => cancelReservation(index)}
      style={{ marginLeft: '12px' }}
    >
      欠席を連絡
    </button>
  </li>
))}

  </ul>
)}
<h3>欠席連絡一覧（テスト用）</h3>

{absenceReports.length === 0 ? (
  <p>欠席連絡はありません</p>
) : (
  <ul>
    {absenceReports.map((report, index) => (
    <li key={index}>
    {report}
    <button onClick={() => approveMakeup(index)}>
      振替を承認
    </button>
  </li>
    ))}
  </ul>
)}

  </div>
)}

    </div>
  );
}

export default App;
