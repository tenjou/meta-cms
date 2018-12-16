import { component, componentVoid, elementOpen, elementClose, elementVoid, text, store } from "wabi"
import Caret from "./Caret"
import Checkbox from "./Checkbox"
import Word from "./Word"
import NumberInput from "./NumberInput"
import FloatInput from "./FloatInput"
import Select from "./Select"
import SchemaService from "../service/SchemaService"
import Commander from "../Commander"
import RemoveRowCommand from "../command/RemoveRowCommand"

const propsCaret = { class: "caret" }

const findSchema = (schema, type) => {
	for(let n = 0; n < schema.length; n++) {
		const entry = schema[n]
		if(entry.type === type) {
			return entry.data.buffer
		}
	}
	return null
}

const SheetItem = component({
	state: {
		value: null,
		cache: null,
		schema: null,
		asset: null, 
		index: -1
	},

	mount() {
		this.propsRemove = { onclick: this.handleRemove.bind(this) }
	},

	render() {
		const schema = this.$schema
		const schemaBuffer = schema.buffer

		elementOpen("row")
			if(schema.props) {
				elementOpen("field", propsCaret)
					componentVoid(Caret, { bind: `${this.bind.value}/__cache/open` })
				elementClose("field")
			}

			for(let n = 0; n < schemaBuffer.length; n++) {
				elementOpen("field")
					this.renderValue(schemaBuffer[n])
				elementClose("field")
			}

			elementOpen("field")
				elementOpen("button", this.propsRemove)
					text("Remove")
				elementClose("button")
			elementClose("field")
		elementClose("row")

		if(this.$cache.open) {
			const props = schema.props

			elementOpen("properties")
				for(let n = 0; n < props.length; n++) {
					const entry = schemaBuffer[props[n]]

					if(entry.type === "Type") {
						const type = this.$value[entry.key]
						const typeBuffer = findSchema(entry.schema, type)
						for(let n = 0; n < typeBuffer.length; n++) {
							const entry = typeBuffer[n]
							elementOpen("property")
								elementOpen("key")
									text(entry.key)
								elementClose("key")

								elementOpen("value")
									this.renderValue(entry)
								elementClose("value")
							elementClose("property")
						}
					}
				}
			elementClose("properties")
		}
	},

	renderValue(entry) {
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
		Commander.execute(new RemoveRowCommand(this.$asset, this.$value))
	}	
})

const Sheet = component({
	state: {
		value: null,
		data: null,
		schema: null
	},

	render() {
		const items = this.$data
		const schema = this.$schema
		const schemaBuffer = schema.buffer

		elementOpen("sheet")
			elementOpen("head")
				if(schema.complex) {
					elementOpen("field", propsCaret)
					elementClose("field")
				}

				for(let n = 0; n < schemaBuffer.length; n++) {
					elementOpen("field")
						text(schemaBuffer[n].key)
					elementClose("field")
				}	
				
				elementVoid("field")			
			elementClose("head")

			for(let n = 0; n < items.length; n++) {
				componentVoid(SheetItem, { 
					bind: {
						value: `${this.bind.data}/${n}`,
						cache: `${this.bind.data}/${n}/__cache`
					}, 
					$schema: schema, 
					$asset: this.$value,
					$index: n
				})
			}
		elementClose("sheet")
	}
})

export default Sheet