import { store } from "wabi"
import Utils from "../Utils"

store.set("column-types", [ "String", "Number", "Boolean", "Id" ])

const create = (id, data, schema) => {
    const schemaNew = {}
    let itemsFromPrev = 0

    const asset = store.get(`asset/${id}`)
    const buffer = data.buffer
	const bufferPrev = prepareData(asset.meta.schema).buffer
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

    console.log(asset.data)
    asset.meta.schema = schemaNew
    store.update(`asset/${id}/meta`)
    store.update(`asset/${id}/data`)
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

const modifyAsset_add = (data, value) => {
    for(let n = 0; n < data.length; n++) {
        const item = data[n]
        item[value.key] = createDefaultValue(value.type)
    }
}

const modifyAsset_type = (data, key, type) => {
    for(let n = 0; n < data.length; n++) {
        const item = data[n]
        item[key] = createDefaultValue(type)
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

const createDefaultValue = (type) => {
    switch(type) {
        case "Id":
            return Utils.uuid4()
        case "String":
            return "foo_bar"
        case "Number":
            return 0
        case "Boolean":
            return false
    }
    return null
}

const createRow = (schema) => {
    const row = {}
    for(let key in schema) {
        const item = schema[key]
        row[key] = createDefaultValue(item.type)
    }    
    return row
}

export { create, createItem, prepareData, createDefaultValue, createRow }