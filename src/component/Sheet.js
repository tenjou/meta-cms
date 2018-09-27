import { component, componentVoid, elementOpen, elementClose, text, store } from "wabi"

const Sheet = component({
	state: {
		value: null,
		schema: null
	},

	render() {
		const schema = this.$schema
		const items = this.$value

		if(!schema) {
			elementOpen("info")
				text("No asset selected")
			elementClose("info")
			return
		}

		elementOpen("sheet")
			elementOpen("header")
				elementOpen("item")
					text("#")
				elementClose("item")
				for(let key in schema) {
					elementOpen("item")
						text(key)
					elementClose("item")
				}
			elementClose("header")

			elementOpen("content")
				for(let n = 0; n < items.length; n++) {
					componentVoid(SheetItem, { bind: `${this.bind.value}/${n}`, $schema: schema, $index: n })
				}
			elementClose("content")
		elementClose("sheet")
	}
})

const SheetItem = component({
	state: {
		value: null,
		schema: null,
		index: 0
	},

	render() {
		const fields = this.$value
		const schema = this.$schema

		elementOpen("item")
			elementOpen("field")
				text(this.$index)
			elementClose("field")

			for(let key in schema) {
				elementOpen("field")
					text(fields[key])
				elementClose("field")
			}
		elementClose("item")
	}
})

export default Sheet