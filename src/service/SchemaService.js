import { store } from "wabi"
import Utils from "../Utils"

function SchemaData(id, item) {
	this.id = id
	this.index = id
	this.item = item
	this.data = null
	this.schema = []
	this.cache = createCache()
}

const sortKey = (a, b) => { return a.key.localeCompare(b.key) }

const apply = (id, schema) => {
	const asset = store.get(`assets/${id}`)
	const meta = asset.meta

	const schemaPrev = createSchemaCache(meta.schema)
	diff(asset.data, schema, schemaPrev)
	meta.schema = populateSchema(schema)
	meta.schemaCache = schema

	updateBuffer(asset)
	store.update(`assets/${id}/data`)
	store.update(`assets/${id}/meta`)
}

const diff = (asset, schema, schemaPrev) => {
	const buffer = schema.buffer
	const bufferPrev = schemaPrev.buffer

	const props = []
	let numEntriesPrev = 0
	let types = null
	let typesMap = null
	let typeIndex = -1

	for(let n = 0; n < buffer.length; n++) {
		const entry = buffer[n]
		const entryItem = entry.item
		const entryPrev = bufferPrev.find(src => src.id === entry.id)
		
		if(entryPrev !== undefined) {
			const entryItemPrev = entryPrev.item
			numEntriesPrev++

			if(entryItem.key !== entryItemPrev.key) {
				modifyAsset_rename(asset, entryItemPrev.key, entryItem.key)
			}
			if(entryItem.type !== entryItemPrev.type) {
				modifyAsset_type(asset, entryItem)
			}

			switch(entryItem.type) {
				case "Type": {
					props.push(n)
					types = []
					typesMap = {}
					typeIndex = n

					const schemas = entryItem.schema
					const schemasPrev = entryItemPrev.schema
					const typesPrev = {}
					for(let n = 0; n < schemasPrev.length; n++) {
						const item = schemasPrev[n]
						typesPrev[item.id] = item
					}

					for(let n = 0; n < schemas.length; n++) {
						const schema = schemas[n]
						const schemaPrev = typesPrev[schema.id]
						types.push(schema.type)
						typesMap[schema.type] = n

						if(!schemaPrev) { continue }

						let propsHandled = 0
						const properties = schema.schema.buffer
						const propertiesPrev = schemaPrev.schema.buffer
						for(let m = 0; m < properties.length; m++) {
							const property = properties[m]
							const propertyPrev = propertiesPrev.find(src => src.id === property.id)

							if(propertyPrev !== undefined) {
								if(property.key !== propertyPrev.key) {
									modifyAsset_rename(asset, propertyPrev.key, property.key, entryItem.key, schema.type)
								}
								if(property.type !== propertyPrev.type) {
									modifyAsset_type(asset, property, entryItem.key, schema.type)
								}
								propsHandled++
							}
							else {
								modifyAsset_type(asset, property, entryItem.key, schema.type)
							}

							if(propsHandled !== propertiesPrev.length) {
								loop:
								for(let n = 0; n < propertiesPrev.length; n++) {
									const entry = propertiesPrev[n]
									for(let m = 0; m < properties.length; m++) {
										const item = properties[m]
										if(item.id === entry.id) {
											continue loop
										}
									}
									modifyAsset_remove(asset, entry.key, entryItem.key, schema.type)
								}
							}
						}
					}
				} break

				case "List":
					props.push(n)
					diffList(asset, entry, entryPrev)
					break
			}
		}
		else {
			modifyAsset_type(asset, entryItem)

			switch(entryItem.type) {
				case "Type": {
					props.push(n)
					typeIndex = n

					const schemas = entryItem.schema
					if(schemas.length > 0) {
						types = new Array(schemas.length)
						typesMap = {}
						for(let n = 0; n < schemas.length; n++) {
							const item = schemas[n]
							types[n] = item.type
							typesMap[item.type] = n
						}
						const defaultType = schemas[0]
						modifyAsset_rowType(asset, entryItem.key, defaultType)
					}
				} break

				case "List":
					props.push(n)
					diffList(asset, entry, emptySchemaCache)
					break
			}
		}
	}

	if(numEntriesPrev !== bufferPrev.length) {
		loop:
		for(let n = 0; n < bufferPrev.length; n++) {
			const entryPrev = bufferPrev[n]
			for(let m = 0; m < buffer.length; m++) {
				const entry = buffer[m]
				if(entry.id === entryPrev.id) {
					continue loop
				}
			}
			modifyAsset_remove(asset, entryPrev.item.key)
		}
	}

	schema.props = props
	schema.typeIndex = typeIndex
	schema.types = types
	schema.typesMap = typesMap
}

const diffList = (asset, entry, entryPrev) => {
	for(let m = 0; m < asset.length; m++) {
		const data = asset[m]
		diff(data[entry.item.key], entry.schema, entryPrev.schema)
	}
}

const createCache = () => {
	return { open: false }
}

const createItem = (data, property = false) => {
	const keyBase = property ? "property" : "column"
	let keyIndex = data.id
	let key = `${keyBase}_${keyIndex}`

	const buffer = data.buffer
	for(let n = 0; n < buffer.length; n++) {
		const item = buffer[n].item
		if(item.key === key) {
			keyIndex++
			key = `${keyBase}_${keyIndex}`
			n = 0
			continue
		}
	}

	const item = { key, type: "String" }
	populateFromSchemaType(item)

	const itemData = new SchemaData(data.id++, item)
	return itemData
}

const rebuildBufferItem = (schemaCache, type) => {
	const itemNew = {
		key: schemaCache.item.key,
		type
	}
	populateFromSchemaType(itemNew)

	schemaCache.item = itemNew
	if(type === "List") {
		schemaCache.schema = createSchemaCache()
	}
	else {
		schemaCache.schema = null
	}
}

const createSchemaCache = (schema = null) => {
	const schemaCache = { id: 0, typeIndex: -1, types: null, typesMap: null, buffer: [], props: [] }
	if(!schema) {
		return schemaCache
	}

	const buffer = schemaCache.buffer
	buffer.length = schema.length
	schemaCache.id = schema.length

	for(let n = 0; n < schema.length; n++) {
		const item = schema[n]
		const entry = new SchemaData(n, item)
		buffer[n] = entry
		
		switch(item.type) {
			case "Type":
				break

			case "List":
				entry.schema = createSchemaCache(item.schema)
				break
		}
	}
	// const buffer = schema ? Utils.cloneObj(schema.buffer) : []
	// const id = buffer.length
	// for(let n = 0; n < buffer.length; n++) {
	// 	const item = buffer[n]
	// 	item.id = n
	// 	item.index = n
	// 	item.cache = createCache()
	// 	if(item.type === "Type") {
	// 		const buffer = item.schema
	// 		for(let n = 0; n < buffer.length; n++) {
	// 			const entry = buffer[n]
	// 			entry.id = n
	// 			entry.index = n
	// 			entry.data = prepareData(entry.data)
	// 		}
	// 	}
	// 	else if(item.type === "List") {
	// 		item.buffer = prepareData(item.buffer)
	// 	}
	// }

	return schemaCache
}

const populateSchema = (schemaCache) => {
	const buffer = Utils.cloneObj(schemaCache.buffer)
	const output = new Array(buffer.length)
	for(let n = 0; n < buffer.length; n++) {
		const entry = buffer[n]
		const item = entry.item
		output[n] = item

		switch(item.type) {
			case "List":
				item.schema = populateSchema(entry.schema)
				break
		}
	}
	return output
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

const modifyAsset_rowType = (data, key, typeDef) => {
	const typeBuffer = typeDef.data.buffer
	for(let n = 0; n < data.length; n++) {
		const item = data[n]
		item[key] = typeDef.type
		for(let m = 0; m < typeBuffer.length; m++) {
			const schemaItem = typeBuffer[m]
			item[schemaItem.key] = (schemaItem.default !== undefined) ? schemaItem.default : createDefaultValue(schemaItem, data, schemaItem.key)
		}
	}
}

const modifyAsset_type = (data, schemaItem, typeColumn = null, type = null) => {
	if(typeColumn) {
		for(let n = 0; n < data.length; n++) {
			const item = data[n]
			if(item[typeColumn] === type) {
				item[schemaItem.key] = (schemaItem.default !== undefined) ? schemaItem.default : createDefaultValue(schemaItem, data, schemaItem.key)
			}
		}
	}
	else {
		for(let n = 0; n < data.length; n++) {
			const item = data[n]
			item[schemaItem.key] = (schemaItem.default !== undefined) ? schemaItem.default : createDefaultValue(schemaItem, data, schemaItem.key)
		}
	}
}

const modifyAsset_rename = (data, from, to, typeColumn = null, type = null) => {
	if(typeColumn) {
		for(let n = 0; n < data.length; n++) {
			const item = data[n]
			if(item[typeColumn] === type) {
				item[to] = item[from]
				delete item[from]
			}
		}
	}
	else {
		for(let n = 0; n < data.length; n++) {
			const item = data[n]
			item[to] = item[from]
			delete item[from]
		}
	}
}

const modifyAsset_remove = (data, key, typeColumn = null, type = null) => {
	if(typeColumn) {
		for(let n = 0; n < data.length; n++) {
			const item = data[n]
			if(item[typeColumn] === type) {
				delete item[key]
			}
		}
	}
	else {
		for(let n = 0; n < data.length; n++) {
			const item = data[n]
			delete item[key]
		}
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
		case "List":
		case "Type":
		case "Schema":
			return []
	}
	return null
}

const createRow = (data, schema) => {
	const row = {}
	const buffer = schema.buffer

	for(let n = 0; n < buffer.length; n++) {
		const item = buffer[n].item
		if(data[item.key] !== undefined) {
			row[item.key] = data[item.key]
		}
		else {
			row[item.key] = (item.default !== undefined) ? item.default : createDefaultValue(item, data, item.key)
		}
	}

	if(schema.typeIndex > -1) {
		const entry = buffer[schema.typeIndex]
		if(entry.schema.length > 0) {
			const typeDefault = entry.schema[0]
			const typeBuffer = typeDefault.data.buffer
			for(let n = 0; n < typeBuffer.length; n++) {
				const item = typeBuffer[n]
				row[item.key] = (item.default !== undefined) ? item.default : createDefaultValue(item, data, item.key)
			}
		}
	}

	row.__cache = createCache()
	return row
}

const rebuildRow = (path, schema) => {
	const data = store.get(path)
	const entry = schema.buffer[schema.typeIndex]
	const typeIndex = schema.types.indexOf(data[entry.key])
	const type = entry.schema[typeIndex]

	const row = createRow(data, schema)

	const buffer = type.data.buffer
	for(let n = 0; n < buffer.length; n++) {
		const item = buffer[n]
		row[item.key] = (item.default !== undefined) ? item.default : createDefaultValue(item, data, item.key)
	}

	row.__cache = data.__cache
	store.set(path, row)
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

const loadBuffer = (asset) => {
	const schema = asset.meta.schema
	let idKey = null

	for(let n = 0; n < schema.length; n++) {
		const entry = schema[n]
		if(entry.type === "UID" || entry.type === "GUID") {
			idKey = entry.key
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
	if(!asset) { return }
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

const emptySchemaCache = { 
	schema: createSchemaCache() 
} 

export { apply, createItem, createSchemaCache, createDefaultValue, createRow, isKeyUnique, moveBefore, rebuildBufferItem, rebuildRow,
	loadBuffer, unloadBuffer, updateBuffer, getNamedBuffers }