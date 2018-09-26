
const rngBuffer = new Uint8Array(16)
const tempResult = new Array(16)
const byteToHex = new Array(256)
for(let n = 0; n < 256; n++) {
	byteToHex[n] = (n + 0x100).toString(16).substr(1)
}

const uuid4 = () => {
	crypto.getRandomValues(rngBuffer)
	rngBuffer[6] = (rngBuffer[6] & 0x0f) | 0x40
	rngBuffer[8] = (rngBuffer[8] & 0x3f) | 0x80	
	for(let n = 0; n < 16; n++) {
		tempResult[n] = byteToHex[rngBuffer[n]]
	}
	return tempResult.join("")
}

export { uuid4 }