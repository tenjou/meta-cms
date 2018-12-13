import { component, componentVoid, elementOpen, elementClose, elementVoid, text, store } from "wabi"
import Checkbox from "./Checkbox"
import Word from "./Word"
import NumberInput from "./NumberInput"
import FloatInput from "./FloatInput"
import Select from "./Select"
import SchemaService from "../service/SchemaService"
import Commander from "../Commander"
import RemoveRowCommand from "../command/RemoveRowCommand"

const SheetItem = component({
	state: {
		value: null,
		schema: null,
		asset: null, 
		index: -1
	},

	mount() {
		this.propsRemove = { onclick: this.handleRemove.bind(this) }
	},

	render() {
		const schema = this.$schema.buffer

		elementOpen("row")
			for(let n = 0; n < schema.length; n++) {
				elementOpen("field")
					this.renderValue(schema[n])
				elementClose("field")
			}

			elementOpen("field")
				elementOpen("button", this.propsRemove)
					text("Remove")
				elementClose("button")
			elementClose("field")
		elementClose("row")
	},

	renderValue(entry) {
		const key = entry.key

		switch(entry.type) {
			case "String":
			case "UID":
				componentVoid(Word, { bind: `${this.bind}/${key}` })
				break
			case "Number":
				componentVoid(NumberInput, {
					bind: `${this.bind}/${key}`,
					$min: entry.min,
					$max: entry.max
				})
				break
			case "Float":
				componentVoid(FloatInput, {
					bind: `${this.bind}/${key}`,
					$min: entry.min,
					$max: entry.max,
					$step: entry.step
				})
				break				
			case "Boolean":
				componentVoid(Checkbox, { bind: `${this.bind}/${key}` })
				break
			case "Reference":
				componentVoid(Select, { 
					bind: `${this.bind}/${key}`,
					$src: store.data.buffers[entry.sheet]
				})
				break
			case "Type":
				componentVoid(Select, { 
					bind: `${this.bind}/${key}`,
					$src: this.$schema.types,
					$onChange: () => {
						SchemaService.rebuildRow(this.bind, this.$schema)
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
				for(let n = 0; n < schemaBuffer.length; n++) {
					elementOpen("field")
						text(schemaBuffer[n].key)
					elementClose("field")
				}	
				
				elementVoid("field")			
			elementClose("head")

			for(let n = 0; n < items.length; n++) {
				componentVoid(SheetItem, { 
					bind: `${this.bind.data}/${n}`, 
					$schema: schema, 
					$asset: this.$value,
					$index: n
				})
			}
		elementClose("sheet")
	}
})

export default Sheet