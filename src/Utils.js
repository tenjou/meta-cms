
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

const cloneObj = (obj) => {
	if(Array.isArray(obj)) {
		const result = []
		
		for(let n = 0; n < obj.length; n++) {
			const value = obj[n]
			if(typeof value === "object" && value !== undefined) {
				// TODO: Possibly loop through array and check if there are objects to clone?
				if(value instanceof Array) {
					result[n] = value.slice(0)
				}
				else {
					result[n] = cloneObj(value)
				}
			}
			else {
				result[n] = value
			}
		}
	
		return result
	}

	const result = {}
		
	for(let key in obj) {
		const value = obj[key]
		if(typeof value === "object" && value !== undefined) {
			if(Array.isArray(value)) {
				const array = new Array(value.length)
				for(let n = 0; n < value.length; n++) {
					array[n] = cloneObj(value[n])
				}
				result[key] = array
			}
			else {
				if(value) {
					result[key] = cloneObj(value)
				}
				else {
					result[key] = null
				}
			}
		}
		else {
			result[key] = value
		}
	}

	return result
}

const readFile = (file, callback) => {
	const reader = new FileReader()
	reader.onload = (fileResult) => {
		callback(fileResult.target.result)
	}
	reader.readAsText(file)
}

const dataURItoBlob = (dataURI, type) => {
	const binary = atob(dataURI.split(",")[1])
	const length = binary.length
	const array = new Uint8Array(length)

	for(let n = 0; n < length; n++) {
		array[n] = binary.charCodeAt(n)
	}

	return new Blob([ array ], { type: type })
}

export { uuid4, cloneObj, readFile }