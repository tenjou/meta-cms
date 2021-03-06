import { store } from "wabi"
import FileSystem from "../fs/FileSystem"
import Utils from "../Utils"

const defaultFileName = "db.json"

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
        const schema = asset.cache.schema
		if(!schema) {
			continue
		}
		
        let dictionaryKey = null
        for(let n = 0; n < schema.length; n++) {
            const entry = schema[n]
            if(entry.type === "UID" || entry.type === "GUID") {
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
                processAssetItem(item, schema)
            }
            buffer = dataDictionary
		}      
		else {
            const dataArray = new Array(buffer.length)
            for(let n = 0; n < buffer.length; n++) {
                const item = buffer[n]
                dataArray[n] = item
                processAssetItem(item, schema)
            }
            buffer = dataArray
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
		const asset = assets[key]
		const schema = asset.cache.schema

        if(options.production) {
            const data = assets[key]
            for(let n = 0; n < data.length; n++) {
                processAssetItem(data[n], schema)
            }
        }
        else {
            const asset = assets[key]
            const data = asset.data
            for(let n = 0; n < data.length; n++) {
                processAssetItem(data[n], schema)
            }
            delete asset.cache.schemaCache
        }
    }
}

const processAssetItem = (item, schema) => {
	delete item.__cache
	
	for(let n = 0; n < schema.length; n++) {
		const propertySchema = schema[n]
		switch(propertySchema.type) {
			case "List": {
				const properties = item[propertySchema.key]
				const uidKey = getIdKey(propertySchema.schema)
				if(uidKey) {
					const dict = {}
					item[propertySchema.key] = dict

					for(let n = 0; n < properties.length; n++) {
						const property = properties[n]
						processAssetItem(property, propertySchema.schema)
						dict[property[uidKey]] = property
					}
				}
				else {
					for(let n = 0; n < properties.length; n++) {
						processAssetItem(properties[n], propertySchema.schema)
					}
				}
			} break

			case "Type": {
				const value = item[propertySchema.key]
				processAssetItem(item, propertySchema.schema[value])
			} break
		}
	}
}

const getIdKey = (schema) => {
	for(let n = 0; n < schema.length; n++) {
		const item = schema[n]
		if(item.type === "UID" || item.type === "GUID") {
			return item.key
		}
	}
	return null
}

const exportData = () => {
	const options = store.data.cache.export
	const data = create(options)
	const targetPath = `${options.directory}/${defaultFileName}`
	FileSystem.write(targetPath, data, (error) => {}, !!options.directory)
}

export default { 
	create, exportData
}