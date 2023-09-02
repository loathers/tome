import axios, { AxiosResponse } from 'axios'
import * as fs from 'fs'

function reasonableDefault(
	resultType: string | Record<string, string>,
	typesWithPlaceholders: string[]
) {
	if (typeof resultType !== 'string') {
		const res = ['{\n']
		Object.keys(resultType).forEach((val) => {
			res.push(
				`\t\t${val}: ${reasonableDefault(
					resultType[val],
					typesWithPlaceholders
				)},\n`
			)
		})
		res.push('\t}')
		return res.join('')
	}
	switch (resultType) {
		case 'string':
			return "''"
		case 'number':
			return '0'
		case 'boolean':
			return 'false'
		case 'void':
			return ''
		case 'never':
			return ''
	}
	if (resultType.endsWith('[]')) {
		return '[]'
	}
	if (typesWithPlaceholders.find((t) => t === resultType)) {
		return `makePlaceholder('${resultType}', 'none') as ${resultType}`
	}
	return '{}'
}

function processType(type: string | Record<string, string>) {
	if (typeof type !== 'string') {
		const res = ['{\n']
		Object.keys(type).forEach((val) => {
			res.push(`\t${val}: ${type[val]}\n`)
		})
		res.push('}')
		return res.join('')
	}
	if (['ServantType', 'ThrallType'].find((stringType) => stringType === type)) {
		return 'string'
	}
	return type
}

async function getData(): Promise<AxiosResponse<string, any>> {
	return axios.get<string>('https://unpkg.com/kolmafia@latest/index.d.ts')
}

async function generateFunctions(
	response: Promise<AxiosResponse<string, any>>
) {
	const { data } = await response
	const typesWithPlaceholders: string[] = []

	const typeMatches = data.matchAll(/export class ([^ ]+) extends MafiaClass/gm)

	for (const typeMatch of typeMatches) {
		typesWithPlaceholders.push(typeMatch[1])
	}

	const beginning = fs.readFileSync('./partials/functions.ts.txt')

	const out = [
		beginning.toString(),
		'import {\n',
		...typesWithPlaceholders.map((t) => `\t${t},\n`),
		"} from './types'\n",
		'\n',
	]

	const funcMatches = data.matchAll(
		/export function ([^(]+)\(([^)]*)\): ([^\n]+);\n/gm
	)
	let prevFuncName = ''
	let results: (string | Record<string, string>)[] = []

	function finalizeFunc() {
		if (prevFuncName !== '' && results.length > 0) {
			const def = reasonableDefault(results[0], typesWithPlaceholders)
			const resultsStr = results
				.map((result) => processType(result))
				.join(' | ')
			const isNever = resultsStr === 'never'
			out.push(
				`export function ${prevFuncName}(...args: unknown[]): ${resultsStr} {\n`
			)
			out.push(
				`\t${isNever ? 'throw' : 'return'} remoteCall('${prevFuncName}', args${
					def !== '' ? `, ${def}` : ''
				})\n`
			)
			out.push('}\n')
			results = []
		}
	}

	for (const funcMatch of funcMatches) {
		const funcName = funcMatch[1]
		const params = funcMatch[2]
		let result: string | Record<string, string> = processType(funcMatch[3])

		if (!result.match(/{ \[[^\]]+\]: [^\s]+ }/) && result.match(/{[^}]+}/)) {
			const allMatches = result.matchAll(/ ([a-z_]+): ([^;]+);/g)
			result = {}
			for (const match of allMatches) {
				result[match[1]] = match[2]
			}
		}

		if (funcName !== prevFuncName) {
			finalizeFunc()
			prevFuncName = funcName
		}

		out.push(`export function ${funcName}(${params}): ${processType(result)}\n`)

		// I'm sorry I was lazy but this isn't really impacting script run length much anyway
		if (
			!results.find((res) => JSON.stringify(res) === JSON.stringify(result))
		) {
			results.push(result)
		}
	}

	finalizeFunc()

	fs.writeFileSync('./src/kolmafia/functions.ts', out.join(''))
}

async function generateTypes(response: Promise<AxiosResponse<string, any>>) {
	const { data } = await response
	const beginning = fs.readFileSync('./partials/types.ts.txt')
	const out: string[] = [beginning.toString()]

	const typeMatches = data.matchAll(/^(?:export )?type \w+ = [^;]+;$/gm)
	for (const typeMatch of typeMatches) {
		out.push(`${typeMatch[0]}\n`)
	}

	const classNames: string[] = []
	const classMatches = data.matchAll(
		/export class ([^ ]+) extends MafiaClass {([^}]+)}(\n|$)/gm
	)

	for (const classMatch of classMatches) {
		const className = classMatch[1]
		const body = classMatch[2]

		classNames.push(className)

		out.push(`export class ${className} extends MafiaClass<'${className}'> {\n`)
		out.push(`\tstatic readonly staticType = '${className}'\n`)
		out.push(`\tstatic readonly none = ${className}.get('none')\n`)

		const relevantMatches = body.matchAll(
			/\/\*\*\s+\* ([^*]+) \*\/\n\s+readonly ([^:]+): ([^;]+);/gm
		)

		for (const relevantMatch of relevantMatches) {
			const comment = relevantMatch[1]
			const fieldName = relevantMatch[2]
			const fieldType = processType(relevantMatch[3])

			out.push(
				`\t/**\n\t * ${comment} */\n\treadonly ${fieldName}!: ${fieldType}\n`
			)
		}

		out.push('}\n')
	}

	out.push('\n')
	out.push('export const globalTypes = {\n')
	out.push(classNames.map((className) => `\t${className},\n`).join(''))
	out.push('}\n')

	fs.writeFileSync('./src/kolmafia/types.ts', out.join(''))
}

const data = getData()
generateFunctions(data)
generateTypes(data)
