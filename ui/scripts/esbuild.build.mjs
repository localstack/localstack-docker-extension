import { build } from 'esbuild';
import { createConfig, copyStaticAssets } from './esbuild.common.mjs';

const run = async () => {
  const mode = 'production';
  try {
    await build(createConfig({ mode, clean: true }));
    await copyStaticAssets();
    console.log('esbuild: production bundle generated in ./build');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
};

run();
