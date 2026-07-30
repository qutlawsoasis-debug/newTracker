import { writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://new-tracker-orpin.vercel.app';
const TARGET_USER_ID = '8319427555';

const endpoints = [
  {
    name: 'GET /api/meals',
    method: 'GET',
    url: `${BASE_URL}/api/meals?userId=${TARGET_USER_ID}`,
    headers: {},
    body: null,
  },
  {
    name: 'GET /api/logs',
    method: 'GET',
    url: `${BASE_URL}/api/logs?userId=${TARGET_USER_ID}`,
    headers: {},
    body: null,
  },
  {
    name: 'GET /api/changelog',
    method: 'GET',
    url: `${BASE_URL}/api/changelog`,
    headers: {},
    body: null,
  },
  {
    name: 'POST /api/npc/chat',
    method: 'POST',
    url: `${BASE_URL}/api/npc/chat`,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: TARGET_USER_ID,
      message: 'привет',
    }),
  },
];

async function runBenchmark() {
  console.log(`Starting GainTracker API Benchmark against ${BASE_URL}...`);
  const benchmarkResults = [];

  for (const ep of endpoints) {
    console.log(`\n----------------------------------------`);
    console.log(`Benchmarking: ${ep.name}`);
    console.log(`URL: ${ep.url}`);

    const runs = [];

    for (let i = 1; i <= 3; i++) {
      const startTimeISO = new Date().toISOString();
      const startMark = performance.now();
      let status = 0;
      let statusText = '';
      let contentType = '';
      let responseBodySnippet = '';
      let error = null;

      try {
        const fetchOpts = {
          method: ep.method,
          headers: ep.headers,
        };
        if (ep.body) {
          fetchOpts.body = ep.body;
        }

        const res = await fetch(ep.url, fetchOpts);
        const endMark = performance.now();
        const duration = endMark - startMark;

        status = res.status;
        statusText = res.statusText;
        contentType = res.headers.get('content-type') || '';
        const bodyText = await res.text();
        responseBodySnippet = bodyText.substring(0, 300);

        runs.push({
          run: i,
          startTime: startTimeISO,
          durationMs: parseFloat(duration.toFixed(2)),
          status,
          statusText,
          contentType,
          bodySnippet: responseBodySnippet,
          bodyLength: bodyText.length,
        });

        console.log(`  Run ${i}: Status ${status} | Latency: ${duration.toFixed(2)} ms | Type: ${contentType}`);
      } catch (err) {
        const endMark = performance.now();
        const duration = endMark - startMark;
        error = err.message || String(err);

        runs.push({
          run: i,
          startTime: startTimeISO,
          durationMs: parseFloat(duration.toFixed(2)),
          status: 0,
          statusText: 'FETCH_ERROR',
          error,
        });

        console.log(`  Run ${i}: ERROR - ${error} | Duration: ${duration.toFixed(2)} ms`);
      }
    }

    const validDurations = runs.filter(r => r.status > 0).map(r => r.durationMs);
    const minMs = validDurations.length ? Math.min(...validDurations) : 0;
    const maxMs = validDurations.length ? Math.max(...validDurations) : 0;
    const avgMs = validDurations.length ? validDurations.reduce((a, b) => a + b, 0) / validDurations.length : 0;

    let category = '✅ Работает корректно';
    const statuses = runs.map(r => r.status);
    const all200 = statuses.every(s => s === 200);

    if (statuses.some(s => s === 0 || s >= 500)) {
      category = '❌ Сломано';
    } else if (statuses.some(s => s === 401 || s === 404) || avgMs > 1500 || !all200) {
      category = '⚠️ Работает с замечаниями';
    }

    benchmarkResults.push({
      endpoint: ep.name,
      method: ep.method,
      url: ep.url,
      minMs: parseFloat(minMs.toFixed(2)),
      maxMs: parseFloat(maxMs.toFixed(2)),
      avgMs: parseFloat(avgMs.toFixed(2)),
      category,
      runs,
    });
  }

  const outputPath = join(process.cwd(), 'benchmark_results.json');
  writeFileSync(outputPath, JSON.stringify(benchmarkResults, null, 2), 'utf-8');
  console.log(`\nBenchmark completed! Raw results saved to ${outputPath}`);
}

runBenchmark().catch(err => {
  console.error("Benchmark run failed:", err);
  process.exit(1);
});
