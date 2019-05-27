import { component, componentVoid, elementOpen, elementClose, text, store, element } from "wabi"
import SchemaService from "../service/SchemaService"
import PopupService from "../service/PopupService"
import TextInput from "./TextInput"
import NumberInput from "./NumberInput"
import Select from "./Select"
import Checkbox from "./Checkbox"
import Caret from "./Caret"
import Word from "./Word"

const TypeBuilder = component({
	mount() {
		this.propsAdd = { onclick: this.handleAdd.bind(this) }
		this.handleRemoveFunc = this.handleRemove.bind(this)
	},

	render() {
		const list = this.$value

		elementOpen("builder")
			elementOpen("button", this.propsAdd)
				text("Add")
			elementClose("button")

			elementOpen("list")
				for(let n = 0; n < list.length; n++) {
					elementOpen("item")
						elementOpen("row")
							elementOpen("name")
								componentVoid(Word, { bind: `${this.bind}/${n}/type` })
							elementClose("name")

							elementOpen("button", {
								"data-index": n,
								onclick: this.handleRemoveFunc
							})
								text("Remove")
							elementClose("button")							
						elementClose("row")

						componentVoid(Schema, { 
							bind: {
								value: `${this.bind}/${n}`,
								schema: `${this.bind}/${n}/schema`,
								buffer: `${this.bind}/${n}/schema/buffer`,
							},
							$child: true
						})
					elementClose("item")
				}
			elementClose("list")
		elementClose("builder")
	},

	handleAdd(event) {
		const schema = SchemaService.createSchemaCache()
		this.$value.push({ type: "Type", schema })
		this.updateAll()
	},

	handleRemove(event) {
		const index = event.currentTarget.dataset.index
		store.remove(`${this.bind}/${index}`)
	}
})

const SchemaBuilder = component({
	render() {
		elementOpen("builder")
			componentVoid(Schema, { 
				bind: {
					schema: `${this.bind}`,
					buffer: `${this.bind}/buffer`,
				}
			})		
		elementClose("builder")
	}
})

const EnumBuilder = component({
	render() {
		elementOpen("builder")
			elementOpen("button")
				text("Add")
			elementClose("button")
		elementClose("builder")
	}
})

const SchemaItem = component({
	state: {
		value: null,
		item: null,
		cache: null,
		index: -1,
		onDrop: null
	},

	mount() {
		this.handleChangeFunc = this.handleChange.bind(this)
		this.propsRemove = { onclick: this.handleRemove.bind(this) }
	},

	render() {
		const props = {
			draggable: "true",
			ondragstart: this.handleDrag.bind(this),
			ondrop: this.handleDrop.bind(this),
			ondragover: this.handleDragOver.bind(this)
		}
		const propsRow = {
			style: {
				width: `50%`
			}
		}

		elementOpen("tr", props)
			elementOpen("td")
				componentVoid(Caret, { bind: `${this.bind.cache}/open` })
			elementClose("td")

			elementOpen("td", propsRow)
				componentVoid(TextInput, { bind: `${this.bind.item}/key` })
			elementClose("td")

			elementOpen("td", propsRow)
				componentVoid(Select, { 
					bind: {
						value: `${this.bind.item}/type`,
						src: "column-types" 
					},
					$onChange: this.handleChangeFunc
				})
			elementClose("td")

			elementOpen("td")
				elementOpen("button", this.propsRemove)
					text("Remove")
				elementClose("button")                        
			elementClose("td")
		elementClose("tr")

		if(this.$cache.open) {
			elementOpen("tr", { class: "open" })
				elementOpen("td")
				elementClose("td")

				elementOpen("td", { colspan: 3 })
					elementOpen("list")
						this.renderType()
					elementClose("list")
				elementClose("td")
			elementClose("tr")
		}
	},

	renderType() {
		const typeSchema = store.data.types[this.$value.item.type]
		for(let key in typeSchema) {
			const entry = typeSchema[key]

			elementOpen("item")
				if(entry.type !== "Type" && entry.type !== "Schema") {
					elementOpen("key")
						text(key)
					elementClose("key")
				}

				elementOpen("value")
					switch(entry.type) {
						case "Number":
							componentVoid(NumberInput, { bind: `${this.bind.item}/${key}` })
							break
						case "Float":
							componentVoid(NumberInput, { bind: `${this.bind.item}/${key}` })
							break							
						case "String":
							componentVoid(TextInput, { bind: `${this.bind.item}/${key}` })
							break
						case "Boolean":
							componentVoid(Checkbox, { bind: `${this.bind.item}/${key}` })
							break

						case "Select": {
							const value = this.$item[entry.lookup]
							componentVoid(Select, { 
								bind: `${this.bind.item}/${key}`, 
								$src: store.get(`buffers/${value}`)
							})
						} break	

						case "Sheet":
							componentVoid(Select, { 
								bind: `${this.bind.item}/${key}`, 
								$src: SchemaService.getNamedBuffers()
							})
							break	

						case "Type":
							componentVoid(TypeBuilder, { bind: `${this.bind.value}/schema` })
							break
							
						case "Schema":
							componentVoid(SchemaBuilder, { bind: `${this.bind.value}/schema` })
							break

						case "Enum":
							componentVoid(EnumBuilder, { bind: `${this.bind.item}/${key}` })
							break
					}
				elementClose("value")
			elementClose("item")
		}
	},

	handleChange(value) {
		SchemaService.rebuildBufferItem(this.$value, value)
		store.update(`${this.bind.value}/item`)
	},

	handleRemove(event) {
		store.remove(this.bind.value)
	},

	handleDrag(event) {
		event.dataTransfer.setData("index", this.$index)
	},

	handleDrop(event) {
		event.preventDefault()
		this.$onDrop(event.dataTransfer.getData("index"), this.$index)
	},

	handleDragOver(event) {
		event.preventDefault()
	}
})

const Schema = component({
	state: {
		value: null,
		schema: null,
		buffer: null,
		child: false,
		root: false
	},

	mount() {
		this.handleAddFunc = this.handleAdd.bind(this)
		this.handleApplyFunc = this.handleApply.bind(this)
		this.handleDropFunc = this.handleDrop.bind(this)
	},

	render() {
		elementOpen("schema")
			elementOpen("buttons")
				elementOpen("button", { onclick: this.handleAddFunc })
					text("Add Column")
				elementClose("button")
			elementClose("buttons")

			elementOpen("table")
				elementOpen("tr")
					elementOpen("th")
					elementClose("th")

					elementOpen("th")
						text("name")
					elementClose("th")

					elementOpen("th")
						text("type")
					elementClose("th")
					
					elementOpen("th")
						text("actions")
					elementClose("th")
				elementClose("tr")

				const buffer = this.$buffer
				for(let n = 0; n < buffer.length; n++) {
					componentVoid(SchemaItem, { 
						bind: {
							value: `${this.bind.buffer}/${n}`,
							item: `${this.bind.buffer}/${n}/item`,
							cache: `${this.bind.buffer}/${n}/cache`
						},
						$index: n,
						$onDrop: this.handleDropFunc
					})       
				}   
			elementClose("table")	            

			if(this.$root) {
				elementOpen("buttons")
					elementOpen("button", { class: "green", onclick: this.handleApplyFunc })
						text("Apply")
					elementClose("button")
				elementClose("buttons")
			}
		elementClose("schema")
	},

	handleAdd(event) {
		store.add(this.bind.buffer, SchemaService.createItem(this.$schema, this.$child))
	},

	handleApply(event) {
		SchemaService.apply(this.$value.id, this.$value.schema)
		PopupService.closePopup()
	},

	handleDrop(index, indexBefore) {
		SchemaService.moveBefore(this.$buffer, index, indexBefore)
		store.update(this.bind.buffer)
	}
})

export default Schema