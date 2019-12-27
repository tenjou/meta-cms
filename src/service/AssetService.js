import { store } from "wabi"
import SchemaService from "./SchemaService"
import AddRowCommand from "../command/AddRowCommand"
import AddAssetCommand from "../command/AddAssetCommand"
import RenameAssetCommand from "../command/RenameAssetCommand"
import RemoveAssetCommand from "../command/RemoveAssetCommand"
import Commander from "../Commander"
import Utils from "../Utils"

const open = (id) => {
	store.set("cache/assets/selected", id)
	location.hash = `${store.data.meta.id}/${id}`
}

const tryAdd = (type, schema) => {
    const asset = create(type, schema)
    Commander.execute(new AddAssetCommand(asset))
}

const tryRemove = (id) => {
    Commander.execute(new RemoveAssetCommand(id))
    if(store.data.cache.assets.selected === id) {
        document.location.hash = store.data.meta.id
    }
}

const create = (type) => {
    const asset = {
        meta: {
            id: Utils.uuid4(),
            name: type,
            type,
            schema: [],
            schemaCache: SchemaService.createSchemaCache()
        },
		data: [],
		cache: {
			sortKey: null,
			sortAsc: true
		}
    }
    return asset
}

const createSheet = () => {
    tryAdd("Sheet")
}

const edit = (id) => {

}

const addRow = (id) => {
    const assetPath = `assets/${id}`
    const asset = store.get(assetPath)
    const row = SchemaService.createRow(asset.data, asset.meta.schemaCache)
    Commander.execute(new AddRowCommand(`${assetPath}/data`, row, true))
}

const closeAll = (id) => {
	const assetPath = `assets/${id}`
	const asset = store.get(assetPath)
	closeAllArray(asset.data)
	store.update(assetPath)
}

const closeAllArray = (array) => {
	for(let n = 0; n < array.length; n++) {
		const item = array[n]
		for(let keyId in item) {
			const keyItem = item[keyId]
			if(Array.isArray(keyItem)) {
				closeAllArray(keyItem)
			}
		}
		item.__cache.open = false
	}	
}

const sort = (dataPath, cachePath, sortKey, type) => {
	const data = store.get(dataPath)
	const cache = store.get(cachePath)
	if(cache.sortKey === sortKey) {
		cache.sortAsc = !cache.sortAsc
	}
	else {
		cache.sortKey = sortKey
	}

	switch(type) {
		case "Boolean":
		case "Number":
		case "Float": {
			if(cache.sortAsc) {
				data.sort((a, b) => {
					return a[sortKey] - b[sortKey]
				})
			}
			else {
				data.sort((a, b) => {
					return b[sortKey] - a[sortKey]
				})
			}
		} break

		case "GUID": {
			if(cache.sortAsc) {
				data.sort((a, b) => {
					return a[sortKey].localeCompare(b[sortKey], "en", { sensitivity: 'base', numeric: false })
				})
			}
			else {
				data.sort((a, b) => {
					return b[sortKey].localeCompare(a[sortKey], "en", { sensitivity: 'base', numeric: false })
				})
			}
		} break		

		default: {
			if(cache.sortAsc) {
				data.sort((a, b) => {
					return a[sortKey].localeCompare(b[sortKey], "en", { sensitivity: "base", numeric: true })
				})
			}
			else {
				data.sort((a, b) => {
					return b[sortKey].localeCompare(a[sortKey], "en", { sensitivity: "base", numeric: true })
				})
			}
		} break
	}

	closeAllArray(data)

	store.update(dataPath)
	store.update(`${cachePath}/sortKey`)
	store.update(`${cachePath}/sortAsc`)
}

export { 
	open, tryAdd, create, createSheet, tryRemove, edit, addRow,
	closeAll,
	sort
}