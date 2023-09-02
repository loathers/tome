import * as types from './kolmafia/types'

export const placeholderTypes = {
	Bounty: 'bounties',
	Class: 'classes',
	Coinmaster: 'coinmasters',
	Effect: 'effects',
	Element: 'elements',
	Familiar: 'familiars',
	Item: 'items',
	Location: 'locations',
	Modifier: 'modifiers',
	Monster: 'monsters',
	Path: 'paths',
	Phylum: 'phyla',
	Servant: 'servants',
	Skill: 'skills',
	Slot: 'slot',
	Stat: 'stat',
	Thrall: 'thralls',
	Vykea: 'vykea',
} as const

export type PlaceholderTypes = keyof typeof placeholderTypes

export type Placeholder<T extends PlaceholderTypes> =
	| {
			objectType: T
			identifierString: string
	  }
	| {
			objectType: T
			identifierNumber: number
	  }

export function makePlaceholder<T extends PlaceholderTypes>(
	objectType: T,
	identifier: string | number
): Placeholder<T> {
	return {
		objectType,
		[typeof identifier === 'number' ? 'identifierNumber' : 'identifierString']:
			identifier,
	} as Placeholder<T>
}

export function placeholderIdentifier<T extends PlaceholderTypes>(
	placeholder: Placeholder<T>
): string | number {
	return 'identifierString' in placeholder
		? placeholder.identifierString
		: placeholder.identifierNumber
}

export type Full<T extends PlaceholderTypes> = T extends 'Bounty'
	? types.Bounty
	: T extends 'Class'
	? types.Class
	: T extends 'Coinmaster'
	? types.Coinmaster
	: T extends 'Effect'
	? types.Effect
	: T extends 'Element'
	? types.Element
	: T extends 'Familiar'
	? types.Familiar
	: T extends 'Item'
	? types.Item
	: T extends 'Location'
	? types.Location
	: T extends 'Modifier'
	? types.Modifier
	: T extends 'Monster'
	? types.Monster
	: T extends 'Phylum'
	? types.Phylum
	: T extends 'Servant'
	? types.Servant
	: T extends 'Skill'
	? types.Skill
	: T extends 'Slot'
	? types.Slot
	: T extends 'Stat'
	? types.Stat
	: T extends 'Thrall'
	? types.Thrall
	: T extends 'Vykea'
	? types.Vykea
	: never
