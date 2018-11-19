import { component, componentVoid, elementOpen, elementClose, elementVoid, text, store } from "wabi"
import Checkbox from "./Checkbox"
import Word from "./Word"
import NumberInput from "./NumberInput"
import Select from "./Select"

const SheetItem = component({
	state: {
		value: null,
		schema: null,
		index: 0
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
					$src: [ "a", "b" ]
				})
				break
			default: 
				text(this.$value[key])
				break
		}
	},

	handleRemove(event) {
		store.remove(this.bind)
	}
})

const Sheet = component({
	state: {
		value: null,
		schema: null
	},

	render() {
		const schema = this.$schema
		const items = this.$value
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
				componentVoid(SheetItem, { bind: `${this.bind.value}/${n}`, $schema: schema, $index: n })
			}
		elementClose("sheet")
	}
})

export default Sheet