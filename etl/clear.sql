-- Пересоздаёт trips с фильтром валидных поездок из trips_raw
-- Запускать по одному запросу сверху вниз (или Alt+X целиком)
CREATE TABLE IF NOT EXISTS trips AS trips_raw;

INSERT INTO trips
SELECT * FROM trips_raw
WHERE ts >= '2024-01-01' AND ts < '2025-01-01'
  AND dropoff_ts > ts
  AND dateDiff('hour', ts, dropoff_ts) <= 24;