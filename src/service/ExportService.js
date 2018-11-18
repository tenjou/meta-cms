import { store } from "wabi"

const create = (options) => {
    const data = options.production ? createProduction(options.named, options.dictionary) : createProject()
    if(options.minify) {
        return JSON.stringify(data)
    }
    return JSON.stringify(data, null, "\t")    
}

const createProject = () => {
    const data = {
        meta: store.data.meta,
        assets: store.data.assets
    }
    return data
}

const createProduction = (named, dictionary) => {
    const assets = store.data.assets
    const data = {
        meta: store.data.meta,
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

export { create }