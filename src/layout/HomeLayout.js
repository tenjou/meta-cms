import { component, componentVoid, elementOpen, elementClose, elementVoid, text, store } from "wabi"
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
	const cache = store.get(`assets/${id}/cache`)
	const schema = SchemaService.createSchemaCache(Utils.cloneObj(cache.schema))
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
		const data = this.$value

		elementOpen("panel")
			if(!data) {
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
					switch(data.meta.type) {
						case "Sheet":
							componentVoid(Sheet, {
								bind: {
									value: `${this.bind}/data`,
									cache: `${this.bind}/cache`,
									schema: `${this.bind}/cache/schemaCache`
								}	
							})
							break
					}
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
		this.handleContextFunc = this.handleContext.bind(this)
		this.propsA = { 
			onclick: this.handleSelect.bind(this),
			ondblclick: this.handleOpen.bind(this)
		}		
	},

	render() {
		const meta = this.$value
		const icon = store.data.icons[meta.type]
		const props = {
			class: (store.data.cache.assets.selected === meta.id) ? "active" : "",
			oncontextmenu: this.handleContextFunc
		}

		elementOpen("item", props)
			elementVoid("i")
			elementVoid("i", { class: icon })

			elementOpen("a", this.propsA)
				componentVoid(Word, { bind: `${this.bind}/name` })
			elementClose("a")
		elementClose("item")
	},

	handleSelect(event) {
		AssetService.select(this.$value.id)
	},

	handleOpen(event) {
		AssetService.open(this.$value.id)
	},

	handleContext(event) {
		MenuService.show("assets.item", this.$value.id, event)
	}
})

const Folder = component({
	state: {
		value: null,
		open: false
	},

	mount() {
		this.handleContextFunc = this.handleContext.bind(this)
		this.propsA = { 
			onclick: this.handleClick.bind(this)
			// onclick: this.handleSelect.bind(this),
			// ondblclick: this.handleOpen.bind(this)
		}		
	},

	render() {
		const meta = this.$value
		const icon = store.data.icons[meta.type]
		const props = {
			class: (store.data.cache.assets.selected === meta.id) ? "active" : "",
			oncontextmenu: this.handleContextFunc
		}

		elementOpen("item", props)
			if(this.$open) {
				elementVoid("i", { class: "fas fa-caret-down" })
			}
			else {
				elementVoid("i", { class: "fas fa-caret-right" })
			}

			elementVoid("i", { class: icon })

			elementOpen("a", this.propsA)
				componentVoid(Word, { bind: `${this.bind.value}/name` })
			elementClose("a")
		elementClose("item")
	},

	handleClick(event) {
		event.preventDefault()

		if(event.detail % 2) {
			AssetService.select(this.$value.id)
		}
		else {
			AssetService.open(this.$value.id)
		}
	},

	handleContext(event) {
		MenuService.show("assets.item", this.$value.id, event)
	}
})

const AssetPanel = component({
	state: {
		value: null,
		selected: null
	},

	mount() {
		this.bind = {
			value: "assets",
			selected: "cache/assets/selected"
		}
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
						if(asset.meta.type === "Folder") {
							componentVoid(Folder, { 
								bind: {
									value: `assets/${asset.meta.id}/meta`,
									open: `assets/${asset.meta.id}/cache/open`,
								}
							})
						}
						else {
							componentVoid(Asset, { bind: `assets/${asset.meta.id}/meta` })

						}
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
			assetId: "cache/assets/opened",
			loading: "state/project/loading"
		}
	},

	render() {	
		if(this.$loading) {
			componentVoid(LoadingLayout)
		}
		else {
			console.log(this.$assetId)
		
			elementOpen("layout")
				componentVoid(Menu)
	
				elementOpen("workspace")
					componentVoid(ContentPanel, { bind: `assets/${this.$assetId}` })
					componentVoid(AssetPanel)
				elementClose("workspace")
			elementClose("layout")
	
			componentVoid(Popups)
			componentVoid(ContextMenu)
		}
	}
})

export default HomeLayout