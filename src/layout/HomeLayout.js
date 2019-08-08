import { component, componentVoid, elementOpen, elementClose, elementVoid, text } from "wabi"
import LoadingLayout from "./LoadingLayout"
import AssetService from "../service/AssetService"
import PopupService from "../service/PopupService"
import SchemaService from "../service/SchemaService"
import Sheet from "../component/Sheet"
import Popups from "../component/Popups"
import Schema from "../component/Schema"
import Word from "../component/Word"
import Menu from "../component/Menu"
import Utils from "../Utils"

const editSchema = (id) => {
	const meta = store.get(`assets/${id}/meta`)
	const schema = SchemaService.createSchemaCache(Utils.cloneObj(meta.schema))
	store.set("cache/schema", { id, schema })

	PopupService.openPopup("Edit schema", () => { 
		componentVoid(Schema, {
			bind: {
				value: "cache/schema",
				schema: "cache/schema/schema",
				buffer: "cache/schema/schema/buffer"
			},
			$root: true
		})
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
					text("Nothing Selected")
				elementClose("info")
			}
			else {
				elementOpen("header")
					elementOpen("name")
						componentVoid(Word, { bind: `${this.bind}/meta/name` })
					elementClose("name")

					elementOpen("buttons")
						elementOpen("button", { onclick: this.handleAddRowFunc })
							elementVoid("i", { class: "fas fa-plus" })
						elementClose("button")		
						
						elementOpen("button", { onclick: this.handleEditFunc })
							elementVoid("i", { class: "fas fa-pen" })
						elementClose("button")							
					elementClose("buttons")
				elementClose("header")

				elementOpen("content")
					componentVoid(Sheet, {
						bind: {
							value: `${this.bind}/data`,
							schema: `${this.bind}/meta/schemaCache`
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
			onclick: this.handleClickFunc
		}

		elementOpen("item", props)
			elementOpen("a", propsA)
				componentVoid(Word, { bind: `${this.bind}/name` })
			elementClose("a")

			elementOpen("buttons")
				elementOpen("button", { onclick: this.handleRemoveFunc })
					elementVoid("i", { class: "fas fa-times" })
				elementClose("button")			
			elementClose("buttons")
		elementClose("item")
	},

	handleRemove(event) {
		if(confirm("Are you sure you want to delete this asset?")) {
			AssetService.tryRemove(this.$value.id)
		}
	},

	handleEdit(event) {
		editSchema(this.$value.id)
	},

	handleClick(event) {
		const id = this.$value.id
		const idPrev = store.get("cache/assets/selected")
		if(idPrev) {
			SchemaService.updateBuffer(store.data.assets[idPrev]) 
		}
		AssetService.open(id)
	}
})

const AssetPanel = component({
	mount() {
		this.bind = "assets"
		this.handleAddAssetFunc = this.handleAddAsset.bind(this)
	},

	render() {
		const assets = this.$value

		elementOpen("panel", { style: "flex: 240px 0 0;", class: "side" })
			elementOpen("header")
				elementOpen("name")
					text("Assets")
				elementClose("name")

				elementOpen("buttons")
					elementOpen("button", { onclick: this.handleAddAssetFunc })
						elementVoid("i", { class: "fas fa-plus" })
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
		AssetService.createSheet()
	}
})

const HomeLayout = component({
	state: {
		assetId: null,
		loading: false
	},

	mount() {
		this.bind = {
			assetId: "cache/assets/selected",
			loading: "state/project/loading"
		}
	},

	render() {	
		if(this.$loading) {
			componentVoid(LoadingLayout)
		}
		else {
			const id = this.$assetId
		
			elementOpen("layout")
				componentVoid(Menu)
	
				elementOpen("workspace")
					componentVoid(ContentPanel, { bind: `assets/${id}` })
					componentVoid(AssetPanel)
				elementClose("workspace")
			elementClose("layout")
	
			componentVoid(Popups)
		}
	}
})

export default HomeLayout