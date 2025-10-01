import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
import dotenv from 'dotenv';
import cleanPlugin from 'esbuild-plugin-clean';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import svgrPlugin from 'esbuild-plugin-svgr';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const rootDir = path.resolve(__dirname, '..');
export const outDir = path.join(rootDir, 'build');
export const publicDir = path.join(rootDir, 'public');
const srcDir = path.join(rootDir, 'src');

const baseLoaders = {
  '.png': 'file',
  '.jpg': 'file',
  '.jpeg': 'file',
  '.gif': 'file',
  '.svg': 'file',
};

dotenv.config({ path: path.join(rootDir, '.env') });

export const copyStaticAssets = async () => {
  try {
    await fs.access(publicDir);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return;
    }
    throw error;
  }

  await fs.mkdir(outDir, { recursive: true });
  await fs.cp(publicDir, outDir, { recursive: true });
};

export const createConfig = ({ mode = 'development', clean = false } = {}) => {
  const isProd = mode === 'production';
  const plugins = [
    NodeModulesPolyfillPlugin(),
    svgrPlugin(),
    {
      name: 'copy-public-dir',
      setup(build) {
        build.onStart(async () => {
          await copyStaticAssets();
        });
      },
    },
  ];

  if (clean) {
    plugins.unshift(
      cleanPlugin({
        patterns: [path.join(outDir, '*')],
      }),
    );
  }

  return {
    absWorkingDir: rootDir,
    entryPoints: [path.join(srcDir, 'index.tsx')],
    bundle: true,
    outdir: outDir,
    format: 'esm',
    sourcemap: isProd ? false : 'inline',
    minify: isProd,
    target: ['es2019'],
    tsconfig: path.join(rootDir, 'tsconfig.json'),
    jsx: 'automatic',
    loader: baseLoaders,
    entryNames: 'assets/[name]',
    chunkNames: 'assets/[name]',
    assetNames: 'assets/[name]',
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    plugins,
    logLevel: 'info',
  };
};
