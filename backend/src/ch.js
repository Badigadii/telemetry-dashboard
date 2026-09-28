import { createClient } from '@clickhouse/client';

export const ch = createClient({
  url: process.env.CH_URL ?? 'http://localhost:8123',
  username: process.env.CH_USER ?? 'default',
  password: process.env.CH_PASSWORD ?? '',
});