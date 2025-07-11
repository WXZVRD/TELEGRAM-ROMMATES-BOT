export function isValidAge(age: number): boolean {
	return isNaN(age) || age < 10 || age > 100
}
