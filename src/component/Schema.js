import { component, componentVoid, elementOpen, elementClose, text, store, element } from "wabi"
import SchemaService from "../service/SchemaService"
import PopupService from "../service/PopupService"
import TextInput from "./TextInput"
import NumberInput from "./NumberInput"
import Select from "./Select"
import Checkbox from "./Checkbox"
import Caret from "./Caret"
import Word from "./Word"

const SchemaBuilder = component({
	mount() {
		this.propsAdd = { onclick: this.handleAdd.bind(this) }
		this.propsRemove = { onclick: this.handleRemove.bind(this) }
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
						elementOpen("type")
							componentVoid(Word, { bind: `${this.bind}/${n}/type` })

							elementOpen("button")
								text("Remove")
							elementClose("button")
						elementClose("type")

						componentVoid(Schema, { 
							bind: {
								value: `${this.bind}/${n}`,
								buffer: `${this.bind}/${n}/data/buffer`,
							},
							$child: true
						})
					elementClose("item")
				}
			elementClose("list")
		elementClose("builder")
	},

	handleAdd(event) {
		const data = SchemaService.prepareData()
		this.$value.push({ type: "Type", data })
		this.updateAll()
	},

	handleRemove(event) {

	}
})

const SchemaItem = component({
	state: {
		value: null,
		schema: null,
		cache: false,
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
				componentVoid(TextInput, { bind: `${this.bind.value}/key` })
			elementClose("td")

			elementOpen("td", propsRow)
				componentVoid(Select, { 
					bind: {
						value: `${this.bind.value}/type`,
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
		const typeSchema = store.data.types[this.$value.type]
		for(let key in typeSchema) {
			const entry = typeSchema[key]
			const props = { bind: `${this.bind.value}/${key}` }

			elementOpen("item")
				if(entry.type !== "Schema") {
					elementOpen("key")
						text(key)
					elementClose("key")
				}

				elementOpen("value")
					switch(entry.type) {
						case "Number":
							componentVoid(NumberInput, props)
							break
						case "Float":
							componentVoid(NumberInput, props)
							break							
						case "String":
							componentVoid(TextInput, props)
							break
						case "Boolean":
							componentVoid(Checkbox, props)
							break

						case "Select": {
							const value = this.$value[entry.lookup]
							componentVoid(Select, { 
								bind: `${this.bind.value}/${key}`, 
								$src: store.get(`buffers/${value}`)
							})
						} break	

						case "Sheet":
							componentVoid(Select, { 
								bind: `${this.bind.value}/${key}`, 
								$src: SchemaService.getNamedBuffers()
							})
							break	
							
						case "Schema":
							componentVoid(SchemaBuilder, { bind: `${this.bind.value}/${key}` })
							break
					}
				elementClose("value")
			elementClose("item")
		}
	},

	handleChange(value) {
		const itemNew = SchemaService.rebuildBufferItem(this.$value, value)
		store.set(this.bind.value, itemNew)
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
		buffer: null,
		child: false
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
							schema: `assets/${this.$value.id}/meta/schema`,
							cache: `${this.bind.buffer}/${n}/cache`
						},
						$index: n,
						$onDrop: this.handleDropFunc
					})       
				}   
			elementClose("table")	            

			if(!this.$child) {
				elementOpen("buttons")
					elementOpen("button", { onclick: this.handleApplyFunc })
						text("Apply")
					elementClose("button")
				elementClose("buttons")
			}
		elementClose("schema")
	},

	handleAdd(event) {
		store.add(this.bind.buffer, SchemaService.createItem(this.$value.data))
	},

	handleApply(event) {
		SchemaService.create(this.$value.id, this.$value.data)
		PopupService.closePopup()
	},

	handleDrop(index, indexBefore) {
		SchemaService.moveBefore(this.$buffer, index, indexBefore)
		store.update(this.bind.buffer)
	}
})

export default Schema