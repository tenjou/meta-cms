import { component, componentVoid, elementOpen, elementClose, elementVoid, text, store } from "wabi"
import Caret from "./Caret"
import Checkbox from "./Checkbox"
import Word from "./Word"
import NumberInput from "./NumberInput"
import FloatInput from "./FloatInput"
import Select from "./Select"
import SchemaService from "../service/SchemaService"
import Commander from "../Commander"
import AddRowCommand from "../command/AddRowCommand"
import RemoveRowCommand from "../command/RemoveRowCommand"

const propsCaret = { class: "caret" }

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
		key: null,
		schema: null
	},

	mount() {
		this.propsAdd = {
			onclick: this.handleAdd.bind(this)
		}
	},

	render() {
		elementOpen("property")
			elementOpen("key")
				text(this.$key)
			elementClose("key")

			elementOpen("value")
				elementOpen("button", this.propsAdd)
					text("Add Row")
				elementClose("button")
			elementClose("value")
		elementClose("property")

		componentVoid(Sheet, {
			bind: {
				value: this.bind
			},
			$schema: this.$schema
		})
	},

	handleAdd(event) {
		const row = SchemaService.createRow(this.$value, this.$schema)
		Commander.execute(new AddRowCommand(this.bind, row, false))
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
					elementOpen("field")
						this.renderValue(entry.item)
					elementClose("field")
				}
			}

			elementOpen("field")
				elementOpen("button", this.propsRemove)
					text("Remove")
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
					bind: `${this.bind.value}/${entry.key}`,
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

	handleRemove(event) {
		const buffer = this.bind.value.split("/")
		const path = buffer.slice(0, buffer.length - 1).join("/")
		Commander.execute(new RemoveRowCommand(path, this.$value))
	}
})

const Sheet = component({
	state: {
		value: null,
		schema: null
	},

	render() {
		const items = this.$value
		const schema = this.$schema
		const buffer = schema.buffer

		elementOpen("sheet")
			elementOpen("head")
				if(schema.props.length > 0) {
					elementOpen("field", propsCaret)
					elementClose("field")
				}

				for(let n = 0; n < buffer.length; n++) {
					const entry = buffer[n]
					if(entry.item.type !== "List") {
						elementOpen("field")
							text(entry.item.key)
						elementClose("field")
					}
				}	
				elementVoid("field")
			elementClose("head")

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
		elementClose("sheet")
	}
})

export default Sheet