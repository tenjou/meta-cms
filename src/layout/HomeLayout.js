import { component, componentVoid, elementOpen, elementClose, text } from "wabi"
import AssetService from "../service/AssetService"
import PopupService from "../service/PopupService"
import SchemaService from "../service/SchemaService"
import Sheet from "../component/Sheet"
import Popups from "../component/Popups"
import Schema from "../component/Schema"

const editSchema = (id) => {
	const schema = store.get(`asset/${id}/meta/schema`)
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
		const id = this.$value

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
						text("Edit")
					elementClose("button")							
				elementClose("buttons")
			elementClose("header")

			elementOpen("content")
				componentVoid(Sheet, {
					bind: {
						value: `asset/${id}/data`,
						schema: `asset/${id}/meta/schema`
					}	
				})
			elementClose("content")
		elementClose("panel")
	},

	handleAddRow(event) {
		AssetService.addRow(this.$value)
	},

	handleEdit(event) {
		editSchema(this.$value)
	}
})

const AssetPanel = component({
	mount() {
		this.bind = "asset"
		this.handleAddAssetFunc = this.handleAddAsset.bind(this)
		this.handleAddEnumFunc = this.handleAddEnum.bind(this)
	},

	render() {
		const assets = this.$value
		const types = {}
		for(let key in assets) {
			const asset = assets[key]
			const buffer = types[asset.meta.type]
			if(buffer) {
				buffer.push(asset)
			}
			else {
				types[asset.meta.type] = [ asset ]
			}
		}

		elementOpen("panel", { style: "flex: 200px 0 0;" })
			elementOpen("buttons")
				elementOpen("button", { onclick: this.handleAddAssetFunc })
					text("Sheet")
				elementClose("button")

				elementOpen("button", { onclick: this.handleAddEnumFunc })
					text("Enum")
				elementClose("button")				
			elementClose("buttons")

			elementOpen("content")
				for(let type in types) {
					const buffer = types[type]

					elementOpen("list")
						elementOpen("header")
							text(type)
						elementClose("header")

						for(let n = 0; n < buffer.length; n++) {
							const asset = buffer[n]
							componentVoid(Asset, { bind: `asset/${asset.meta.id}/meta` })
						}					
					elementClose("list")
				}				
			elementClose("content")
		elementClose("panel")
	},

	handleAddAsset(event) {
		AssetService.addSheet()
	},

	handleAddEnum(event) {
		AssetService.addEnum()
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
		editSchema(this.$value.id)
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