import { store } from "wabi"
import Utils from "../Utils"

const create = (options) => {
    const data = options.production ? createProduction(options.named, options.dictionary) : createProject()
    data.meta.export = {
        production: options.production
    }
    cleanup(data)
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

const createProduction = (named, dictionary) => {
    const assets = Utils.cloneObj(store.data.assets)
    const data = {
        meta: Utils.cloneObj(store.data.meta),
        assets: {}
    }
    for(let key in assets) {
        const asset = assets[key]
        let buffer = asset.data

        if(dictionary) {
            const dataDictionary = {}
            for(let n = 0; n < buffer.length; n++) {
                const item = buffer[n]
                dataDictionary[item.name] = item
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

const cleanup = (data) => {
    const production = data.meta.export.production
    const assets = data.assets
    for(let key in assets) {
        const asset = assets[key]
        if(production) {

        }
        else {
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