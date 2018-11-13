import { component, componentVoid, elementOpen, elementClose, text, store } from "wabi"
import Checkbox from "./Checkbox"
import Word from "./Word"
import NumberInput from "./NumberInput"

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

		elementOpen("tr")
			for(let key in schema) {
				elementOpen("td")
					this.renderValue(key)
				elementClose("td")
			}

			elementOpen("td")
				elementOpen("button", this.propsRemove)
					text("Remove")
				elementClose("button")
			elementClose("td")
		elementClose("tr")
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
		const cellStyle = {
			style: {
				width: `${100 / schemaBuffer.length}%`
			}
		}

		elementOpen("table")
			elementOpen("tr")
				for(let n = 0; n < schemaBuffer.length; n++) {
					const key = schemaBuffer[n]
					elementOpen("th", cellStyle)
						text(key)
					elementClose("th")
				}	
				
				elementOpen("th")
				elementClose("th")				
			elementClose("tr")

			for(let n = 0; n < items.length; n++) {
				componentVoid(SheetItem, { bind: `${this.bind.value}/${n}`, $schema: schema, $index: n })
			}
		elementClose("table")
	}
})

export default Sheet