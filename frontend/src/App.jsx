import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function App() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/coverage')
      .then((r) => {
        if (!r.ok) throw new Error('бэкенд ответил ошибкой');
        return r.json();
      })
      // ClickHouse отдаёт большие числа СТРОКАМИ ("2963732") — превращаем в числа
      .then((rows) => setData(rows.map((r) => ({ ...r, trips: Number(r.trips) }))))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p>Ошибка: {error}</p>;
  if (!data.length) return <p>Загрузка...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>NYC Taxi 2024</h1>
      <h2>Поездки по месяцам</h2>
      <LineChart width={900} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(v) => (v / 1e6).toFixed(1) + 'M'} />
        <Tooltip formatter={(v) => v.toLocaleString('ru-RU')} />
        <Line type="monotone" dataKey="trips" stroke="#2563eb" strokeWidth={2} />
      </LineChart>
    </div>
  );
}