import { build } from 'esbuild'
import babel from 'esbuild-plugin-babel'

build({
	bundle: true,
	minifySyntax: true,
	platform: 'node',
	target: 'esnext',
	external: ['setimmediate', 'tome-kolmafia-client'],
	alias: { kolmafia: 'tome-kolmafia-client' },
	plugins: [babel()],
	define: {
		'process.env.NODE_ENV': '"production"',
	},
	outdir: './KoLmafia',
	entryPoints: {
		tome_client: './src/index.ts',
	},
})
