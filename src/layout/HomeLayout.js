import { component, componentVoid, elementOpen, elementClose, text } from "wabi"
import AssetService from "../service/AssetService"
import Sheet from "../component/Sheet"
import Popups from "../component/Popups"

const ContentPanel = component({
	mount() {
		this.handleAddRowFunc = this.handleAddRow.bind(this)
		this.handleEditFunc = this.handleEdit.bind(this)
	},

	render() {
		const id = this.$value

		elementOpen("panel")
			elementOpen("header")
				elementOpen("name")
					text("Sheet")
				elementClose("name")

				elementOpen("buttons")
					elementOpen("button", { onclick: this.handleAddRowFunc })
						text("Add")
					elementClose("button")		
					
					elementOpen("button", { onclick: this.handleEditFunc })
						text("Edit")
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
		console.log("edit")
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

				elementOpen("button")
					text("Edit")
				elementClose("button")				
			elementClose("buttons")
		elementClose("item")
	},

	handleRemove(event) {
		AssetService.remove(this.$value.id)
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