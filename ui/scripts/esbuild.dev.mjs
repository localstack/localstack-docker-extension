import { context } from 'esbuild';
import { createConfig, outDir, copyStaticAssets, publicDir } from './esbuild.common.mjs';
import { watch } from 'node:fs';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

const run = async () => {
  await copyStaticAssets();
  const ctx = await context(createConfig({ mode: 'development', clean: true }));
  await ctx.watch();
  const server = await ctx.serve({
    servedir: outDir,
    host,
    port,
  });

  const urlHost = server.host === '0.0.0.0' ? 'localhost' : server.host;
  console.log(`esbuild dev server running at http://${urlHost}:${server.port}`);
  console.log('Press Ctrl+C to stop.');

  try {
    watch(publicDir, async () => {
      try {
        await copyStaticAssets();
      } catch (error) {
        console.error('Failed to copy public assets', error);
      }
    });
  } catch (error) {
    console.warn('Static asset watcher unavailable:', error.message);
  }

  const shutdown = async () => {
    await ctx.dispose();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
