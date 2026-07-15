import { Hono } from 'hono';
import type { Env, Variables } from './types';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.notFound((c) => c.json({ message: 'Not found' }, 404));

export default app;
