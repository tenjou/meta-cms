import { store } from "wabi"
import Utils from "../Utils"

const create = (id, data) => {
    const schemaNew = {}
    let itemsFromPrev = 0

    const asset = store.get(`assets/${id}`)
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
            
            if(item.key !== itemPrev.key) { 
                modifyAsset_rename(asset.data, itemPrev.key, item.key)
            }
            if(item.type !== itemPrev.type) {
                modifyAsset_type(asset.data, item)
            }

            schemaNew[item.key] = populateFromSchemaType({ type: item.type }, item)
        }
        else {
            schemaNew[item.key] = populateFromSchemaType({ type: item.type }, item)
            modifyAsset_type(asset.data, item)
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
        }
    }

    asset.meta.schema = schemaNew
    store.update(`assets/${id}/meta`)
    store.update(`assets/${id}/data`)
}

const createItem = (data) => {
    const keyBase = "column"
    let keyIndex = data.id
    let key = `${keyBase}_${keyIndex}`

    for(let n = 0; n < data.buffer.length; n++) {
        const item = data.buffer[n]
        if(item.key === key) {
            keyIndex++
            key = `${keyBase}_${keyIndex}`
            n = 0
            continue
        }
    }

    const item = { 
        id: data.id++, 
        key, 
        type: "String", 
        index: data.buffer.length,
        cache: createCache()
    }
    populateFromSchemaType(item)

    return item
}

const createCache = () => {
    return { 
        open: false
    }
}

const prepareData = (schema) => {
    const buffer = []
    let index = 0
    let id = 0
    for(let key in schema) {
        const entry = schema[key]
        const item = { id, key, type: entry.type, index, cache: createCache() }
        populateFromSchemaType(item, entry)
        buffer.push(item) 
        index++
        id++
    }
    return { id, buffer }
}

const populateFromSchemaType = (item, copy = null) => {
    const typeSchema = store.data.types[item.type]
    
    for(let key in typeSchema) {
        const entry = typeSchema[key]
        if(copy) {
            const value = copy[entry.type]
            if(value !== undefined) {
                item[entry.type] = value
                continue
            }
        }

        item[key] = (entry.value !== undefined) ? entry.value : createDefaultValue(item, null, null)
    }   
    
    return item
}

const modifyAsset_type = (data, schemaItem) => {
    for(let n = 0; n < data.length; n++) {
        const item = data[n]
        item[schemaItem.key] = (schemaItem.default !== undefined) ? schemaItem.default : createDefaultValue(schemaItem, data, schemaItem.key)
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

const createDefaultValue = (schemaItem, data, key) => {
    switch(schemaItem.type) {
        case "ID": {
            let id = 1
            for(;;) {
                for(let n = 0; n < data.length; n++) {
                    const item = data[n]
                    if(item[key] === id) {
                        id++
                    }
                }
                break
            }
            return id
        }

        case "UID": {
            let id = 1
            for(;;) {
                for(let n = 0; n < data.length; n++) {
                    const item = data[n]
                    if(item[key] === id) {
                        id++
                    }
                }
                break
            }
            return id
        }
            
        case "GUID":
            return Utils.uuid4()
        case "String":
            return "Key"
        case "Number":
            return 0
        case "Float":
            return 0.0
        case "Boolean":
            return false
        case "Reference":
            return null
    }
    return null
}

const createRow = (asset) => {
    const row = {}
    const schema = asset.meta.schema
    for(let key in schema) {
        const item = schema[key]
        row[key] = (item.default !== undefined) ? item.default : createDefaultValue(item, asset.data, key)
    }    
    return row
}

const isKeyUnique = (schema, key) => {
    for(let schemaKey in schema) {
        if(schemaKey === key) {
            return false
        }
    }
    return true
}

const moveBefore = (buffer, index, indexBefore) => {
    const item = buffer.splice(index, 1)
    buffer.splice(indexBefore, 0, item[0])
    for(let n = 0; n < buffer.length; n++) {
        buffer[n].index = n
    }
}

const rebuildBufferItem = (item, type) => {
    const itemNew = { 
        id: item.id,
        key: item.key,
        type,
        index: item.index,
        cache: item.cache 
    }
    populateFromSchemaType(itemNew)
    return itemNew
}

const loadBuffer = (asset) => {
    const schema = asset.meta.schema
    let idKey = null

    for(let key in schema) {
        const entry = schema[key]
        if(entry.type === "UID" || entry.type === "GUID") {
            idKey = key
            break
        }
    }

    if(idKey) {
        const data = asset.data
        const buffer = new Array(data.length)
        for(let n = 0; n < data.length; n++) {
            const item = data[n]
            buffer[n] = item[idKey]
        }
        store.set(`buffers/${asset.meta.id}`, buffer)
    }
}

const unloadBuffer = (asset) => {
    store.remove(`buffers/${asset.meta.id}`)
}

const updateBuffer = (asset) => {
    loadBuffer(asset)
    console.log(store.data.buffers[asset.meta.id])
}

export { create, createItem, prepareData, createDefaultValue, createRow, isKeyUnique, moveBefore, rebuildBufferItem,
    loadBuffer, unloadBuffer, updateBuffer }