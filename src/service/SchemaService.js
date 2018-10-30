import { store } from "wabi"

store.set("column-types", [ "String", "Number", "Boolean", "Id" ])

const create = (data, schema) => {
    const schemaNew = {}
    let itemsFromPrev = 0

    const buffer = data.buffer
	const bufferPrev = prepareData(schema).buffer
	const hashes = {}
	for(let n = 0; n < bufferPrev.length; n++) {
		const item = bufferPrev[n]
		hashes[item.id] = item
	}    

    for(let n = 0; n < buffer.length; n++) {
        const item = buffer[n]
        const itemPrev = hashes[item.id]
        if(itemPrev !== undefined) {
            itemsFromPrev++
            schemaNew[item.key] = { type: item.type }
            if(item.key !== itemPrev.key) { 
                console.log(`rename from: ${itemPrev.key} to: ${item.key}`)
            }
            if(item.type !== itemPrev.type) {
                console.log(`change type from: ${itemPrev.type} to: ${item.type}`)
            }
        }
        else {
            schemaNew[item.key] = { type: item.type }
            console.log(`add: ${item.key}`)
        }
    }

    if(itemsFromPrev !== bufferPrev.length) {
        loop:
        for(let n = 0; n < bufferPrev.length; n++) {
            const entry = bufferPrev[n]
            for(let m = 0; m < buffer.length; m++) {
                const item = buffer[m]
                if(item.id === entry.id) {
                    continue loop
                }
            }
            console.log(`remove column: ${entry.key}`)
        }
    }

    console.log(schemaNew)
}

const createItem = (data) => {
    return { id: data.id++, key: "column", type: "String", index: data.buffer.length }
}

const prepareData = (schema) => {
    const buffer = []
    let index = 0
    let id = 0
    for(let key in schema) {
        const entry = schema[key]
        buffer.push({ id, key, type: entry.type, index }) 
        index++
        id++
    }
    return { id, buffer }
}

export { create, createItem, prepareData }