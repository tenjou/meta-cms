import { component, componentVoid, elementOpen, elementClose, text } from "wabi"
import AssetService from "../service/AssetService"
import PopupService from "../service/PopupService"
import SchemaService from "../service/SchemaService"
import Sheet from "../component/Sheet"
import Popups from "../component/Popups"
import Schema from "../component/Schema"

const editSchema = (id) => {
	const schema = store.get(`data/${id}/meta/schema`)
	const data = SchemaService.prepareData(schema)
	store.set("cache/schema", { id, data, schema })

	PopupService.openPopup("Add Column", Schema, { 
		bind: {
			value: "cache/schema",
			buffer: "cache/schema/data/buffer"
		}
	})
}

const ContentPanel = component({
	mount() {
		this.handleAddRowFunc = this.handleAddRow.bind(this)
		this.handleEditFunc = this.handleEdit.bind(this)
	},

	render() {
		const id = this.$value

		editSchema(this.$value)

		elementOpen("panel")
			elementOpen("header")
				elementOpen("name")
					text("Sheet")
				elementClose("name")

				elementOpen("buttons")
					elementOpen("button", { onclick: this.handleAddRowFunc })
						text("Add Row")
					elementClose("button")		
					
					elementOpen("button", { onclick: this.handleEditFunc })
						text("Add Column")
					elementClose("button")							
				elementClose("buttons")
			elementClose("header")

			elementOpen("content")
				componentVoid(Sheet, {
					bind: {
						value: `data/${id}/data`,
						schema: `data/${id}/meta/schema`
					}	
				})
			elementClose("content")
		elementClose("panel")
	},

	handleAddRow(event) {
		AssetService.addRow(this.$value)
	},

	handleEdit(event) {
		editSchema()
	}
})

const AssetPanel = component({
	mount() {
		this.bind = "data"
		this.handleAddAssetFunc = this.handleAddAsset.bind(this)
	},

	render() {
		elementOpen("panel", { style: "flex: 200px 0 0;" })
			elementOpen("content")
				elementOpen("list")
					elementOpen("header")
						elementOpen("name")
							text("sheets")
						elementClose("name")

						elementOpen("buttons")
							elementOpen("button", { onclick: this.handleAddAssetFunc })
								text("Add")
							elementClose("button")
						elementClose("buttons")
					elementClose("header")

					const items = this.$value
					for(let key in items) {
						componentVoid(Asset, { bind: `data/${key}/meta` })
					}					
				elementClose("list")
			elementClose("content")
		elementClose("panel")
	},

	handleAddAsset(event) {
		AssetService.add("Sheet")
	}
})

const Asset = component({
	mount() {
		this.handleRemoveFunc = this.handleRemove.bind(this)
		this.handleEditFunc = this.handleEdit.bind(this)
	},

	render() {
		const meta = this.$value

		elementOpen("item")
			elementOpen("a", { href: `#${meta.id}` })
				text(meta.name)
			elementClose("a")

			elementOpen("buttons")
				elementOpen("button", { onclick: this.handleRemoveFunc })
					text("Remove")
				elementClose("button")			
			elementClose("buttons")
		elementClose("item")
	},

	handleRemove(event) {
		AssetService.remove(this.$value.id)
	},

	handleEdit(event) {
		editSchema()
	}
})

const HomeLayout = component({
	render() {	
		const id = this.$value
		
		elementOpen("layout")
			componentVoid(ContentPanel, { $value: id })
			componentVoid(AssetPanel)
		elementClose("layout")

		componentVoid(Popups)
	}
})

export default HomeLayout