export function arrayToHex(arr) {
	return arr.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function shortId(id: string) {
	if (id.length <= 12) {
		return id;
	}

	const firstSix = id.slice(0, 6);
	const lastSix = id.slice(-6);

	return `${firstSix}..${lastSix}`;
}
