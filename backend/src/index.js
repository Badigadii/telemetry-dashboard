import express from 'express';
import cors from 'cors';
import { ch } from './ch.js';

const app = express();
app.use(cors());

// «Ты жив и видишь базу?» — для проверки связи
app.get('/api/health', async (req, res, next) => {
  try {
    await ch.query({ query: 'SELECT 1' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Вопрос №1: сколько поездок по месяцам (тот SQL, что ты делал в DBeaver руками)
app.get('/api/coverage', async (req, res, next) => {
  try {
    const rs = await ch.query({
      query: `
        SELECT toYYYYMM(ts) AS month, count() AS trips
        FROM trips
        GROUP BY month
        ORDER BY month`,
      format: 'JSONEachRow',
    });
    res.json(await rs.json());
  } catch (e) { next(e); }
});

app.get('/api/quality', async (req, res, next) => {
  try {
    const rs = await ch.query({
      query: `
        SELECT
          count() AS total,
          countIf(passenger_count = 0) AS zero_passengers,
          countIf(trip_distance = 0) AS zero_distance,
          countIf(dropoff_ts <= ts) AS negative_duration
        FROM trips`,
      format: 'JSONEachRow',
    });
    res.json(await rs.json());
  } catch (e) { next(e); }
});

app.get('/api/hello', (req, res) => {
  res.json({ privet: 'mir' });
});

// Если в любом эндпоинте упало — отдать 500 и написать в лог причину
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: 'internal' });
});

app.listen(3001, () => console.log('API on http://localhost:3001'));