import { component, componentVoid, elementOpen, elementClose, elementVoid, text } from "wabi"
import AssetService from "../service/AssetService"
import PopupService from "../service/PopupService"
import SchemaService from "../service/SchemaService"
import Sheet from "../component/Sheet"
import Popups from "../component/Popups"
import Schema from "../component/Schema"
import Word from "../component/Word"
import Menu from "../component/Menu"

const editSchema = (id) => {
	const schema = store.get(`assets/${id}/meta/schema`)
	const data = SchemaService.prepareData(schema)
	store.set("cache/schema", { id, data })

	PopupService.openPopup("Edit schema", Schema, { 
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
		elementOpen("panel")
			if(!this.$value) {
				elementOpen("info")
					text("No asset selected")
				elementClose("info")
			}
			else {
				elementOpen("header")
					elementOpen("name")
						componentVoid(Word, { bind: `${this.bind}/meta/name` })
					elementClose("name")

					elementOpen("buttons")
						elementOpen("button", { onclick: this.handleAddRowFunc })
							text("Add Row")
						elementClose("button")		
						
						elementOpen("button", { onclick: this.handleEditFunc })
							text("Edit")
						elementClose("button")							
					elementClose("buttons")
				elementClose("header")

				elementOpen("content")
					componentVoid(Sheet, {
						bind: {
							value: `${this.bind}/data`,
							schema: `${this.bind}/meta/schema`
						}	
					})
				elementClose("content")
			}
		elementClose("panel")
	},

	handleAddRow(event) {
		AssetService.addRow(this.$value.meta.id)
	},

	handleEdit(event) {
		editSchema(this.$value.meta.id)
	}
})

const Asset = component({
	mount() {
		this.handleRemoveFunc = this.handleRemove.bind(this)
		this.handleEditFunc = this.handleEdit.bind(this)
		this.handleClickFunc = this.handleClick.bind(this)
	},

	render() {
		const meta = this.$value
		const props = {
			class: (store.data.cache.assets.selected === meta.id) ? "active" : "",
		}
		const propsA = { 
			href: `#assets/${meta.id}`, 
			onclick: this.handleClickFunc,
			"data-key": meta.id
		}

		elementOpen("item", props)
			elementOpen("a", propsA)
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
		editSchema(this.$value.id)
	},

	handleClick(event) {
		store.set("cache/assets/selected", event.currentTarget.dataset.key)
	}
})

const AssetPanel = component({
	mount() {
		this.bind = "assets"
		this.handleAddAssetFunc = this.handleAddAsset.bind(this)
	},

	render() {
		const assets = this.$value

		elementOpen("panel", { style: "flex: 200px 0 0;" })
			elementOpen("header")
				elementOpen("name")
					text("Assets")
				elementClose("name")

				elementOpen("buttons")
					elementOpen("button", { onclick: this.handleAddAssetFunc })
						elementVoid("i", { class: "fas fa-plus-circle" })
					elementClose("button")				
				elementClose("buttons")				
			elementClose("header")

			elementOpen("content")
				elementOpen("list", { class: "assets" })
					for(let key in assets) {
						const asset = assets[key]
						componentVoid(Asset, { bind: `assets/${asset.meta.id}/meta` })
					}
				elementClose("list")				
			elementClose("content")
		elementClose("panel")
	},

	handleAddAsset(event) {
		AssetService.addSheet()
	}
})

const HomeLayout = component({
	render() {	
		const id = this.$value
		
		elementOpen("layout")
			componentVoid(Menu)

			elementOpen("workspace")
				componentVoid(ContentPanel, { bind: `assets/${id}` })
				componentVoid(AssetPanel)
			elementClose("workspace")
		elementClose("layout")

		componentVoid(Popups)
	}
})

export default HomeLayout