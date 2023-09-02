import { build } from 'esbuild'
import babel from 'esbuild-plugin-babel'

build({
	bundle: true,
	minifySyntax: true,
	platform: 'node',
	target: 'rhino1.7.13',
	external: ['kolmafia'],
	plugins: [babel()],
	define: {
		'process.env.NODE_ENV': '"production"',
	},
	outdir: './KoLmafia/relay',
	entryPoints: {
		tome_server: './src/index.ts',
	},
})
