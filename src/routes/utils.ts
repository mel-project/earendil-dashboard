export function arrayToHexString(arr) {
	return arr.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
