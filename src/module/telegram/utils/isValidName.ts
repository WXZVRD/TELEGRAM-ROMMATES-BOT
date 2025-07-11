export function isValidName(input: string): boolean {
	if (typeof input !== 'string') return false

	const name = input.trim()
	const namePattern = /^[а-яА-ЯёЁa-zA-Z]+$/
	return name.length > 0 && namePattern.test(name)
}
