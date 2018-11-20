import { component, componentVoid, elementOpen, elementClose, elementVoid, text, store } from "wabi"
import Checkbox from "./Checkbox"
import Word from "./Word"
import NumberInput from "./NumberInput"
import Select from "./Select"
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
		const schema = this.$schema

		elementOpen("row")
			for(let key in schema) {
				elementOpen("field")
					this.renderValue(key)
				elementClose("field")
			}

			elementOpen("field")
				elementOpen("button", this.propsRemove)
					text("Remove")
				elementClose("button")
			elementClose("field")
		elementClose("row")
	},

	renderValue(key) {
		const entry = this.$schema[key]
		const props = { bind: `${this.bind}/${key}` }

		switch(entry.type) {
			case "String":
			case "UID":
				componentVoid(Word, props)
				break
			case "Number":
				componentVoid(NumberInput, props)
				break
			case "Boolean":
				componentVoid(Checkbox, props)
				break
			case "Reference":
				componentVoid(Select, { 
					bind: `${this.bind}/${key}`,
					$src: store.data.buffers.a00712b8dbde477f829def7bcea4942c
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
		const schemaBuffer = Object.keys(schema)

		elementOpen("sheet")
			elementOpen("head")
				for(let n = 0; n < schemaBuffer.length; n++) {
					const key = schemaBuffer[n]
					elementOpen("field")
						text(key)
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