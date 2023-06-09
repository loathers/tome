import { build } from 'esbuild'
import babel from 'esbuild-plugin-babel'

build({
	bundle: true,
	minifySyntax: true,
	platform: 'node',
	target: 'rhino1.7.13',
	external: ['setimmediate', 'tome-kolmafia-client'],
	alias: { kolmafia: 'tome-kolmafia-client' },
	plugins: [babel()],
	define: {
		'process.env.NODE_ENV': '"production"',
	},
	outdir: './build',
	entryPoints: {
		tome_client: './src/index.ts',
	},
})
