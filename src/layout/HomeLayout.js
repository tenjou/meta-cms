import { component, componentVoid, elementOpen, elementClose, elementVoid, text } from "wabi"
import LoadingLayout from "./LoadingLayout"
import AssetService from "../service/AssetService"
import PopupService from "../service/PopupService"
import SchemaService from "../service/SchemaService"
import MenuService from "../service/MenuService"
import Sheet from "../component/Sheet"
import Popups from "../component/Popups"
import Schema from "../component/Schema"
import Word from "../component/Word"
import Menu from "../component/Menu"
import ContextMenu from "../component/ContextMenu"
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
		this.propsCloseAll = { onclick: this.handleCloseAll.bind(this) }
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
						
						elementOpen("button", this.propsCloseAll)
							elementVoid("i", { class: "fas fa-angle-double-up" })
						elementClose("button")	
					elementClose("buttons")
				elementClose("header")

				elementOpen("content")
					componentVoid(Sheet, {
						bind: {
							value: `${this.bind}/data`,
							cache: `${this.bind}/cache`,
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
	},

	handleCloseAll(event) {
		AssetService.closeAll(this.$value.meta.id)
	}
})

const Asset = component({
	mount() {
		this.handleClickFunc = this.handleClick.bind(this)
		this.handleContextFunc = this.handleContext.bind(this)
	},

	render() {
		const meta = this.$value
		const props = {
			class: (store.data.cache.assets.selected === meta.id) ? "active" : "",
			oncontextmenu: this.handleContextFunc
		}
		const propsA = { 
			onclick: this.handleClickFunc
		}

		elementOpen("item", props)
			elementVoid("i", { class: "fas fa-database" })

			elementOpen("a", propsA)
				componentVoid(Word, { bind: `${this.bind}/name` })
			elementClose("a")
		elementClose("item")
	},

	handleClick(event) {
		const id = this.$value.id
		const idPrev = store.get("cache/assets/selected")
		if(idPrev) {
			SchemaService.updateBuffer(store.data.assets[idPrev]) 
		}
		AssetService.open(id)
	},

	handleContext(event) {
		MenuService.show("assets.item", this.$value.id, event)
	}
})

const AssetPanel = component({
	mount() {
		this.bind = "assets"
		this.handleAddAssetFunc = this.handleAddAsset.bind(this)
		this.handleContextFunc = this.handleContext.bind(this)
	},

	render() {
		const assets = this.$value

		elementOpen("panel", { 
			style: "flex: 240px 0 0;", 
			class: "side",
			oncontextmenu: this.handleContextFunc
		})
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
		const currentTarget = event.currentTarget
		const x = currentTarget.offsetLeft + ((currentTarget.offsetWidth * 0.5) | 0)
		const y = currentTarget.offsetTop + ((currentTarget.offsetHeight * 0.5) | 0)
		MenuService.show("assets", null, event, x, y)
	},

	handleContext(event) {
		MenuService.show("assets", null, event)
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
			componentVoid(ContextMenu)
		}
	}
})

export default HomeLayout