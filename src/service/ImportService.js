import { store } from "wabi"
import SchemaService from "./SchemaService"
import Commander from "../Commander"

const load = (json) => {
    try {
        const imported = JSON.parse(json)
        store.set("buffers", {})

        const assets = imported.assets
        for(let key in assets) {
            const asset = assets[key]
            const data = asset.data
            asset.meta.schemaCache = SchemaService.createSchemaCache(asset.meta.schema)
            fillCache(data)
            SchemaService.updateBuffer(asset)
        }
        store.set("meta", imported.meta)
        store.set("assets", imported.assets)
        
        Commander.flush()
    }
    catch(error) {
        console.error(error)
    }
}

const fillCache = (data) => {
    for(let n = 0; n < data.length; n++) {
        const item = data[n]
        for(let key in item) {
            const property = item[key]
            if(Array.isArray(property)) {
                fillCache(property)
            }
        }
        item.__cache = SchemaService.createCache()   
    }    
}

export { load }