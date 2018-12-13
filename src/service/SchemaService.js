import { store } from "wabi"
import Utils from "../Utils"

const sortKey = (a, b) => { return a.key.localeCompare(b.key) }

const create = (id, data) => {
    const schemaNew = {}
    let itemsFromPrev = 0

    const asset = store.get(`assets/${id}`)
    const buffer = data.buffer
    const bufferPrev = asset.meta.schema.buffer
    
	const hashes = {}
	for(let n = 0; n < bufferPrev.length; n++) {
		const item = bufferPrev[n]
		hashes[item.id] = item
    }    
    
    let types = null
    let typeIndex = null

    for(let n = 0; n < buffer.length; n++) {
        const item = buffer[n]
        const itemPrev = hashes[item.id]

        if(item.type === "Type") {
            const schemas = item.schema
            types = []
            typeIndex = n

            for(let n = 0; n < schemas.length; n++) {
                const item = schemas[n]
                types.push(item.type)
            }

    //         const typeBuffer = {}
    //         console.log(schemas)
            // for(let n = 0; n < schemas.length; n++) {
            //     const item = schemas[n]
            //     const data = item.data
            //     for(let m = 0; m < data.length; m++) {
            //         const dataItem = data[m]
            //         console.log(dataItem)
            //     }
            // }    
        }

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

    asset.meta.schema.complex = (types) ? true : false
    asset.meta.schema.typeIndex = typeIndex
    asset.meta.schema.types = types
    asset.meta.schema.buffer = cleanupBuffer(buffer)
    store.update(`assets/${id}/meta`)
    store.update(`assets/${id}/data`)
}

const createItem = (data, property = false) => {
    const keyBase = property ? "property" : "column"
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

const cleanupBuffer = (buffer) => {
    for(let n = 0; n < buffer.length; n++) {
        const item = buffer[n]
        delete item.cache
        delete item.index
    }
    return buffer
}

const createCache = () => {
    return { 
        open: false
    }
}

const createSchema = () => {
    return { complex: false, typeIndex: 0, types: null, buffer: [] }   
}

const prepareData = (schema = null) => {
    const buffer = schema ? Utils.cloneObj(schema.buffer) : []
    const id = buffer.length
    for(let n = 0; n < buffer.length; n++) {
        const item = buffer[n]
        item.id = n
        item.index = n
        item.cache = createCache()
        if(item.type === "Type") {
            const buffer = item.schema
            for(let n = 0; n < buffer.length; n++) {
                const entry = buffer[n]
                entry.data = prepareData(entry.data)
            }
        }
    }
    return { id, buffer }
}

const populateFromSchemaType = (item, copy = null) => {
    const typeSchema = store.data.types[item.type]

    for(let key in typeSchema) {
        const entry = typeSchema[key]
        if(copy) {
            const value = copy[key]
            if(value !== undefined) {
                item[key] = value
                continue
            }
        }

        item[key] = (entry.value !== undefined) ? entry.value : createDefaultValue(entry, null, null)
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
        case "UID":
            return "uid"            
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
        case "Schema":
            return []
    }
    return null
}

const createRow = (asset) => {
    const row = {}
    const schema = asset.meta.schema.buffer
    for(let n = 0; n < schema.length; n++) {
        const item = schema[n]
        row[item.key] = (item.default !== undefined) ? item.default : createDefaultValue(item, asset.data, item.key)
    }    
    return row
}

const rebuildRow = (path, schema) => {
    const row = store.get(path)
    const entry = schema.buffer[schema.typeIndex]
    const typeIndex = schema.types.indexOf(row[entry.key])
    const type = entry.schema[typeIndex]
    
    console.log(type)
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
    if(!asset) {
        return
    }
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
}

const getNamedBuffers = () => {
    const named = []
    const buffers = store.data.buffers
    for(let key in buffers) {
        const asset = store.data.assets[key]
        named.push({ key: asset.meta.name, value: asset.meta.id })
    }
    return named
}

export { create, createItem, createSchema, prepareData, createDefaultValue, createRow, isKeyUnique, moveBefore, rebuildBufferItem, rebuildRow,
    loadBuffer, unloadBuffer, updateBuffer, getNamedBuffers }