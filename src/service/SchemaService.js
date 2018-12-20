import { store } from "wabi"
import Utils from "../Utils"

const sortKey = (a, b) => { return a.key.localeCompare(b.key) }

const create = (id, data) => {
	let itemsFromPrev = 0

	const asset = store.get(`assets/${id}`)
	const schema = prepareData(asset.meta.schema)
	const buffer = data.buffer
	const bufferPrev = schema.buffer

	const props = []
	let types = null
	let typesMap = null
	let typeIndex = 0

	for(let n = 0; n < buffer.length; n++) {
		const item = buffer[n]
		const itemPrev = bufferPrev.find(src => src.id === item.id)

		if(itemPrev !== undefined) {
			itemsFromPrev++

			if(item.key !== itemPrev.key) {
				modifyAsset_rename(asset.data, itemPrev.key, item.key)
			}
			if(item.type !== itemPrev.type) {
				modifyAsset_type(asset.data, item)
			}

			if(item.type === "Type") {
				const schemas = item.schema
				const schemasPrev = itemPrev.schema
				const typesPrev = {}

				types = []
				typesMap = {}
				typeIndex = n
				props.push(n)

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
					const properties = schema.data.buffer
					const propertiesPrev = schemaPrev.data.buffer
					for(let m = 0; m < properties.length; m++) {
						const property = properties[m]
						const propertyPrev = propertiesPrev.find(src => src.id === property.id)

						if(propertyPrev !== undefined) {
							if(property.key !== propertyPrev.key) {
								modifyAsset_rename(asset.data, propertyPrev.key, property.key, item.key, schema.type)
							}
							if(property.type !== propertyPrev.type) {
								modifyAsset_type(asset.data, property, item.key, schema.type)
							}
							propsHandled++							
						}
						else {
							modifyAsset_type(asset.data, property, item.key, schema.type)
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
								modifyAsset_remove(asset.data, entry.key, item.key, schema.type)
							}
						}
					}
				}
			}
		}
		else {
			modifyAsset_type(asset.data, item)

			if(item.type === "Type") {
				const schemas = item.schema
				props.push(n)
				typeIndex = n

				if(schemas.length > 0) {
					types = new Array(schemas.length)
					typesMap = {}
					for(let n = 0; n < schemas.length; n++) {
						const item = schemas[n]
						types[n] = item.type
						typesMap[item.type] = n
					}
					const defaultType = schemas[0]
					modifyAsset_rowType(asset.data, item.key, defaultType)
				}
			}
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

	asset.meta.schema.props = (props.length > 0) ? props : null
	asset.meta.schema.typeIndex = typeIndex
	asset.meta.schema.types = types
	asset.meta.schema.typesMap = typesMap
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

const createCache = () => {
	return {
		open: false
	}
}

const createSchema = () => {
	return { props: null, typeIndex: 0, types: null, typesMap: null, buffer: [] }
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
				entry.id = n
				entry.index = n
				entry.data = prepareData(entry.data)
			}
		}
	}
	return { id, buffer }
}

const cleanupBuffer = (buffer) => {
	for(let n = 0; n < buffer.length; n++) {
		const item = buffer[n]
		delete item.cache
		delete item.index

		if(item.type === "Type") {
			const buffer = item.schema
			for(let n = 0; n < buffer.length; n++) {
				const entry = buffer[n]
				delete entry.cache
				delete entry.index
			}
		}
	}
	return buffer
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
		case "Schema":
			return []
	}
	return null
}

const createRow = (data, schema) => {
	const row = {}
	const buffer = schema.buffer
	for(let n = 0; n < buffer.length; n++) {
		const item = buffer[n]
		if(data[item.key] !== undefined) {
			row[item.key] = data[item.key]
		}
		else {
			row[item.key] = (item.default !== undefined) ? item.default : createDefaultValue(item, data, item.key)
		}
	}

	const entry = buffer[schema.typeIndex]
	const typeDefault = entry.schema[0]
	const typeBuffer = typeDefault.data.buffer
	for(let n = 0; n < typeBuffer.length; n++) {
		const item = typeBuffer[n]
		row[item.key] = (item.default !== undefined) ? item.default : createDefaultValue(item, data, item.key)
	}

	row.__cache = { open: false }
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
	const schemaBuffer = asset.meta.schema.buffer
	let idKey = null

	for(let key in schemaBuffer) {
		const entry = schemaBuffer[key]
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