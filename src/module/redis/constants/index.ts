export const REDIS_KEY_PROFILE_ID_SESSION_KEY = () => 'profileId'
export const REDIS_KEY_PROFILE_SESSION_KEY = () => 'profile'

export const REDIS_KEY_MATCHES_PROFILES = (
	title: string = 'MATCHES_PROFILE',
	id: number
) => `${title}:${id}`
