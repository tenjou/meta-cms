import { component, componentVoid, elementOpen, elementClose, elementVoid, text, store } from "wabi"
import Caret from "./Caret"
import Checkbox from "./Checkbox"
import Word from "./Word"
import NumberInput from "./NumberInput"
import FloatInput from "./FloatInput"
import Select from "./Select"
import SchemaService from "../service/SchemaService"
import AssetService from "../service/AssetService"
import Commander from "../Commander"
import AddRowCommand from "../command/AddRowCommand"
import RemoveRowCommand from "../command/RemoveRowCommand"

const propsCaret = { class: "caret" }
const propsFieldButton = { class: "button" }
const propsFieldType = { class: "input" }

const findSchema = (schema, type) => {
	for(let n = 0; n < schema.length; n++) {
		const entry = schema[n]
		if(entry.type === type) {
			return entry.schema.buffer
		}
	}
	return null
}

const SheetList = component({
	state: {
		value: null,
		cache: null,
		key: null,
		schema: null
	},

	mount() {
		this.propsAdd = {
			onclick: this.handleAdd.bind(this)
		}
	},

	render() {
		elementOpen("sheet-list")
			elementOpen("header")
				elementOpen("name")
					text(this.$key)
				elementClose("name")

				elementOpen("button", this.propsAdd)
					elementVoid("i", { class: "fas fa-plus" })
				elementClose("button")
			elementClose("header")

			componentVoid(Sheet, {
				bind: {
					value: this.bind.value,
					cache: this.bind.cache
				},
				$schema: this.$schema
			})
		elementClose("sheet-list")
	},

	handleAdd(event) {
		const row = SchemaService.createRow(this.$value, this.$schema)
		Commander.execute(new AddRowCommand(this.bind.value, row, false))
	}	
})

const SheetRow = component({
	state: {
		value: null,
		cache: null,
		schema: null,
		index: -1
	},

	mount() {
		this.handleSortFunc = this.handleSort.bind(this)
		this.propsRemove = { onclick: this.handleRemove.bind(this) }
	},

	render() {
		const schema = this.$schema
		const buffer = schema.buffer
		
		elementOpen("row")
			if(schema.props.length > 0) {
				elementOpen("field", propsCaret)
					componentVoid(Caret, { bind: `${this.bind.value}/__cache/open` })
				elementClose("field")
			}

			for(let n = 0; n < buffer.length; n++) {
				const entry = buffer[n]
				if(entry.item.type !== "List") {
					elementOpen("field", (entry.item.type === "Type") ? propsFieldType : null)
						this.renderValue(entry.item)
					elementClose("field")
				}
			}

			elementOpen("field", propsFieldButton)
				elementOpen("button", this.propsRemove)
					elementVoid("i", { class: "fas fa-times" })
				elementClose("button")
			elementClose("field")
		elementClose("row")

		if(schema.props.length > 0 && this.$cache.open) {
			const props = schema.props

			elementOpen("properties")
				for(let n = 0; n < props.length; n++) {
					const entry = buffer[props[n]]
					const entryItem = entry.item

					if(entryItem.type === "Type") {
						const type = this.$value[entryItem.key]
						if(type) {
							const typeBuffer = findSchema(entry.schema, type)
							for(let n = 0; n < typeBuffer.length; n++) {
								const entry = typeBuffer[n]
								if(entry.item.type === "List") {
									this.renderValue(entry.item, entry.schema)
								}
								else {
									elementOpen("property")
										elementOpen("key")
											text(entry.item.key)
										elementClose("key")
		
										elementOpen("value")
											this.renderValue(entry.item, entry.schema)
										elementClose("value")
									elementClose("property")
								}
							}
						}
					}
					else if(entryItem.type === "List") {
						this.renderValue(entryItem, entry.schema)
					}
				}
			elementClose("properties")
		}
	},

	renderValue(entry, schema) {
		const key = entry.key

		switch(entry.type) {
			case "String":
			case "UID":
				componentVoid(Word, { bind: `${this.bind.value}/${key}` })
				break
			case "Number":
				componentVoid(NumberInput, {
					bind: `${this.bind.value}/${key}`,
					$min: entry.min,
					$max: entry.max
				})
				break
			case "Float":
				componentVoid(FloatInput, {
					bind: `${this.bind.value}/${key}`,
					$min: entry.min,
					$max: entry.max,
					$step: entry.step
				})
				break				
			case "Boolean":
				componentVoid(Checkbox, { bind: `${this.bind.value}/${key}` })
				break
			case "List":
				componentVoid(SheetList, {
					bind: {
						value: `${this.bind.value}/${entry.key}`,
						cache: `${this.bind.value}/__cache`
					},
					$key: entry.key,
					$schema: schema
				})
				break
			case "Reference":
				componentVoid(Select, { 
					bind: `${this.bind.value}/${key}`,
					$src: store.data.buffers[entry.sheet]
				})
				break
			case "Type":
				componentVoid(Select, { 
					bind: `${this.bind.value}/${key}`,
					$src: this.$schema.types,
					$onChange: () => {
						SchemaService.rebuildRow(this.bind.value, this.$schema)
					}
				})
				break
			default: 
				text(this.$value[key])
				break
		}
	},

	handleSort(event) {
		const key = event.currentTarget.dataset.key
		console.log(key)
	},

	handleRemove(event) {
		if(confirm("Are you sure you want to delete this row?")) {
			const buffer = this.bind.value.split("/")
			const path = buffer.slice(0, buffer.length - 1).join("/")
			Commander.execute(new RemoveRowCommand(path, this.$value))
		}
	}
})

const Sheet = component({
	state: {
		value: null,
		schema: null,
		cache: null
	},

	mount() {
		this.handleSortFunc = this.handleSort.bind(this)
		this.itemCount = 0
	},

	render() {
		const items = this.$value
		const schema = this.$schema
		const cache = this.$cache
		const buffer = schema.buffer

		if(this.itemCount === 0) {
			this.itemCount = items.length
		}

		elementOpen("sheet")
			elementOpen("head")
				if(schema.props.length > 0) {
					elementOpen("field", propsCaret)
					elementClose("field")
				}

				for(let n = 0; n < buffer.length; n++) {
					const entry = buffer[n]
					if(entry.item.type !== "List") {
						elementOpen("field", {
							"data-key": entry.item.key,
							"data-type": entry.item.type,
							class: (entry.item.type === "Type") ? "input" : null,
							onclick: this.handleSortFunc
						})
							text(entry.item.key)

							if(entry.item.key === cache.sortKey) {
								elementOpen("sort")
									elementVoid("i", { 
										class: cache.sortAsc ? "fas fa-angle-down" : "fas fa-angle-up" 
									})
								elementClose("sort")
							}
						elementClose("field")
					}
				}
				elementVoid("field", propsFieldButton)
			elementClose("head")

			const element = elementOpen("content").element
				for(let n = 0; n < items.length; n++) {
					componentVoid(SheetRow, { 
						bind: {
							value: `${this.bind.value}/${n}`,
							cache: `${this.bind.value}/${n}/__cache`
						},
						$schema: schema,
						$index: n
					})
				}
			elementClose("content")

			if(this.itemCount !== items.length) {
				element.scrollTop = element.scrollHeight
			}
		elementClose("sheet")
	},

	handleSort(event) {
		const key = event.currentTarget.dataset.key
		const type = event.currentTarget.dataset.type
		AssetService.sort(this.bind.value, this.bind.cache, key, type)
	}	
})

export default Sheet