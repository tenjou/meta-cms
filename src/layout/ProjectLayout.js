import { component, componentVoid, elementOpen, elementClose, text, elementVoid, store } from "wabi"
import ProjectService from "../service/ProjectService"
import Loader from "../component/Loader"
import TextInput from "../component/TextInput"
import Word from "../component/Word"
import Utils from "../Utils"

const CreateProjectWindow = component({
	mount() {
		this.propsCreate = { class: "green", onclick: this.handleCreate.bind(this) }
		this.propsClose = { onclick: this.handleClose.bind(this) }
	},

	render() {
		elementOpen("window")
			elementOpen("header")
				elementOpen("name")
					text("Create Project")
				elementClose("name")

				elementOpen("button", this.propsClose)
					elementVoid("i", { class: "fas fa-times" })
				elementClose("button")
			elementClose("header")

			elementOpen("content")
				elementOpen("form")
					elementOpen("entry")
						elementOpen("key")
							text("Name")
						elementClose("key")

						elementOpen("value")
							componentVoid(TextInput, { bind: "state/project/create/name" })

							// elementOpen("error")
							// 	text("invalid-error")
							// elementClose("error")
						elementClose("value")
					elementClose("entry")
				elementClose("form")

				elementOpen("buttons")
					elementOpen("button", this.propsCreate)
						text("Create")
					elementClose("button")
				elementClose("buttons")
			elementClose("content")
		elementClose("window")		
	},

	handleCreate(event) {
		ProjectService.create()
	},

	handleClose(event) {
		ProjectService.createPopupClose()
	}
})

const ProjectItem = component({
	mount() {
		this.props = { onclick: this.handleClick.bind(this) }
		this.propsRemove = { onclick: this.handleRemove.bind(this) }
		this.handleChangeFunc = this.handleChange.bind(this)
	},

	render() {
		elementOpen("item", this.props)
			elementOpen("name")
				componentVoid(Word, { bind: `${this.bind}/name`, $onchange: this.handleChangeFunc })
			elementClose("name")

			elementOpen("button", this.propsRemove)
				elementVoid("i", { class: "fas fa-times" })
			elementClose("button")
		elementClose("item")
	},

	handleClick(event) {
		ProjectService.open(this.$value.id)
	},

	handleRemove(event) {
		event.preventDefault()
		event.stopPropagation()
		ProjectService.remove(this.$value.id)
	},

	handleChange(newValue) {
		if(newValue) {
			ProjectService.rename(this.$value.id, newValue)
		}
		return newValue
	}
})

const ProjectWindow = component({
	state: {
		projects: [],
		loading: false
	},

	mount() {
		this.bind = {
			projects: "state/project/data",
			loading: "state/project/loading"
		}
		this.propsCreate = { class: "green", onclick: this.handleCreate.bind(this) }
		ProjectService.fetch()
	},

	render() {
		elementOpen("window")
			elementOpen("header")
				elementOpen("name")
					text("Projects")
				elementClose("name")
			elementClose("header")

			elementOpen("content")				
				if(this.$loading) {
					elementOpen("projects", { class: "center" })
						componentVoid(Loader, { $value: "white" })
					elementClose("projects")
				}
				else {
					const projects = this.$projects
					if(Utils.hasItems(projects)) {
						elementOpen("projects")
							for(let key in projects) {
								componentVoid(ProjectItem, { bind: `${this.bind.projects}/${key}/meta` })
							}
						elementClose("projects")
					}
					else {
						elementOpen("projects", { class: "center" })
							text("No projects")
						elementClose("projects")
					}
				}

				elementOpen("buttons")
					elementOpen("button", this.propsCreate)
						text("Create")
					elementClose("button")
				elementClose("buttons")
			elementClose("content")
		elementClose("window")		
	},

	handleCreate(event) {
		ProjectService.createPopupShow()
	}
})

const ProjectLayout = component({
	mount() {
		this.bind = "state/project/create"
	},

	render() {
		elementOpen("layout", { class: "center" })
			if(this.$value) {
				componentVoid(CreateProjectWindow)
			}
			else {
				componentVoid(ProjectWindow)
			}
		elementClose("layout")
	}
})

export default ProjectLayout