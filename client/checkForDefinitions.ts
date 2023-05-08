import * as fs from 'fs'
import { abort } from 'process'

if (
	fs.existsSync('./src/kolmafia/functions.ts') &&
	fs.existsSync('./src/kolmafia/types.ts')
) {
	console.log('functions.ts and types.ts are present, skipping generation.')
	abort()
}
