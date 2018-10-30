import { store } from "wabi"

store.set("column-types", [ "String", "Number", "Boolean", "Id" ])

const create = (id, data, schema) => {
    const schemaNew = {}
    let itemsFromPrev = 0

    const asset = store.get(`asset/${id}`)
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
                modifyAsset_rename(asset.data, itemPrev.key, item.key)
                console.log(`rename from: ${itemPrev.key} to: ${item.key}`)
            }
            if(item.type !== itemPrev.type) {
                modifyAsset_type(asset.data, item.key, item.type)
                console.log(`change type from: ${itemPrev.type} to: ${item.type}`)
            }
        }
        else {
            schemaNew[item.key] = { type: item.type }
            modifyAsset_add(asset.data, item)
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
            modifyAsset_remove(asset.data, entry.key)
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

const modifyAsset_add = (data, item) => {
    for(let n = 0; n < data.length; n++) {
        const item = data[n]
        
    }
}

const modifyAsset_type = (data, key, type) => {
    for(let n = 0; n < data.length; n++) {
        const item = data[n]
        
    }
}

const modifyAsset_rename = (data, from, to) => {
    for(let n = 0; n < data.length; n++) {
        const item = data[n]
        item[to] = item[from]
        delete item[from]
    }
}

const modifyAsset_remove = (data, key) => {
    for(let n = 0; n < data.length; n++) {
        const item = data[n]
        delete item[key]
    }
}

export { create, createItem, prepareData }