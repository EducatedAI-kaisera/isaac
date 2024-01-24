export function base64ToUint8Array(base64) {
	const binaryString = window.atob(base64);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}
