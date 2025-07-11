export function isValidGender(gender: string): boolean {
	if (typeof gender !== 'string') {
	}
	const genderData = ['male', 'female', 'any', 'парень', 'девушка', 'любой']

	if (!genderData.includes(gender)) return false

	return true
}
