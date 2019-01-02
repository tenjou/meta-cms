import { store } from "wabi"
import Utils from "../Utils"

const create = (options) => {
    const data = options.production ? createProduction(options.named) : createProject()
    if(!options.production) {
        data.meta.export = options
        cleanup(data, options)
    }
    if(options.minify) {
        return JSON.stringify(data)
    }
    return JSON.stringify(data, null, "\t")    
}

const createProject = () => {
    const data = {
        meta: Utils.cloneObj(store.data.meta),
        assets: Utils.cloneObj(store.data.assets)
    }
    return data
}

const createProduction = (named) => {
    const assets = Utils.cloneObj(store.data.assets)
    const data = {
        meta: Utils.cloneObj(store.data.meta),
        assets: {}
    }
    for(let key in assets) {
        const asset = assets[key]
        const schema = asset.meta.schema

        let dictionaryKey = null
        for(let n = 0; n < schema.length; n++) {
            const entry = schema[n]
            if(entry.type === "UID") {
                dictionaryKey = entry.key
                break
            }
        }

        let buffer = asset.data

        if(dictionaryKey) {
            const dataDictionary = {}
            for(let n = 0; n < buffer.length; n++) {
                const item = buffer[n]
                dataDictionary[item[dictionaryKey]] = item
                delete item[dictionaryKey]
                cleanupAssetItem(item)
            }
            buffer = dataDictionary
        }        

        if(named) {
            data.assets[asset.meta.name] = buffer
        }
        else {
            data.assets[key] = buffer
        }
    }
    return data
}

const cleanup = (data, options) => {
    const assets = data.assets
    for(let key in assets) {
        if(options.production) {
            const data = assets[key]
            for(let n = 0; n < data.length; n++) {
                cleanupAssetItem(data[n])
            }
        }
        else {
            const asset = assets[key]
            const data = asset.data
            for(let n = 0; n < data.length; n++) {
                cleanupAssetItem(data[n])
            }
            delete asset.meta.schemaCache
        }
    }
}

const cleanupAssetItem = (item) => {
    delete item.__cache
    for(let key in item) {
        const property = item[key]
        if(Array.isArray(property)) {
            for(let n = 0; n < property.length; n++) {
                cleanupAssetItem(property[n])
            }
        }
    }
}

export { create }