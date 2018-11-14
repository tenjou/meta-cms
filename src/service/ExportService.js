import { store } from "wabi"

const create = (options) => {
    const data = options.production ? createProduction(options.named) : createProject()
    if(options.minify) {
        return JSON.stringify(data)
    }
    return JSON.stringify(data, null, "\t")    
}

const createProject = (named) => {
    const data = {
        meta: store.data.meta,
        assets: store.data.assets
    }
    return data
}

const createProduction = (named) => {
    const assets = store.data.assets
    const data = {
        meta: store.data.meta,
        assets: {}
    }
    for(let key in assets) {
        const asset = assets[key]
        if(named) {
            data.assets[asset.meta.name] = asset.data
        }
        else {
            data.assets[key] = asset.data
        }
    }
    return data
}

export { create }