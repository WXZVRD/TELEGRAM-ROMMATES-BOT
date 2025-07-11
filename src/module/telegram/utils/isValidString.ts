export function isValidString(input: string): boolean {
	if (typeof input !== 'string') return false

	const str: string = input.trim()
	const strPattern: RegExp = /^[а-яА-ЯёЁa-zA-Z\s\-]+$/
	return str.length > 0 && strPattern.test(str)
}
