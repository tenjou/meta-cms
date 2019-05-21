import { store } from "wabi"
import FileSystem from "../fs/FileSystem"
import Utils from "../Utils"

let activeProject = null

const create = () => {
	const createData = store.data.state.project.create
	const data = {
		meta: {
			id: Utils.uuid4(),
			name: createData.name,
			created: Date.now(),
		},
		assets: {},
		cache: {}
	}
	FileSystem.createDirectory(data.meta.id, (error, path) => {
		if(error) {
			console.error(error)
			createPopupClose()
			return
		}
		FileSystem.write(`${data.meta.id}/db.json`, JSON.stringify(data), (error, path) => {
			if(error) {
				console.error(error)
			}
			createPopupClose()
		})
	})
}

const remove = (id) => {
	FileSystem.removeDirectory(id, (error, path) => {
		if(error) {
			console.error(error)
			return
		}
		store.remove(`state/project/data/${id}`)
	})
}

const rename = (id, name) => {
	FileSystem.read(path, (error, json) => {
		if(error) {
			console.error(error)
			return
		}
		const data = JSON.parse(json)
		data.meta.name = name

		FileSystem.write(`${id}/db.json`, JSON.stringify(data), (error) => {
			if(error) {
				console.error(error)
				return
			}
		})
	})
}

const open = (id) => {
	location.hash = `${id}`
}

const load = (id) => {
	FileSystem.read(`${id}/db.json`, (error, json) => {
		if(error) {
			console.error(error)
			return
		}		
		
		activeProject = JSON.parse(json)
		store.set("meta", activeProject.meta)
		store.set("assets", activeProject.assets)
		store.set("cache", activeProject.cache)
		FileSystem.rootDirectory = id
	})
}

const fetch = () => {
	store.set("state/project/loading", true)

	if(!window.electron) {
		FileSystem.rootDirectory = ""
		FileSystem.readDirectory("", (error, data) => {
			if(error) {
				console.error("(Project.fetch) Error while reading root directory")
				return
			}
			fetchLocal(data, handleFetch)
		})
	}
	else {	
		// TODO: Electron project fetch
		callback({})
	}
}

const fetchLocal = (data, onDone) => {
	const num = data.length
	const projects = {}
	let numToLoad = 0

	if(num > 0) {
		for(let n = 0; n < num; n++) {
			const item = data[n]
			if(!item.isDirectory) { continue }

			const projectDbFile = `${item.name}/db.json`
			numToLoad++

			FileSystem.read(projectDbFile, (error, data) => {
				if(error) {
					console.warn("(Project.fetchLocal) Error while reading project db file:", projectDbFile)
				}
				else {
					projects[item.name] = JSON.parse(data)
				}

				numToLoad--
				if(numToLoad === 0) {
					if(onDone) {
						onDone(projects)
					}					

				}
			})
		}
	}
	else {
		if(onDone) {
			onDone(projects)
		}
	}
}

const handleFetch = (projects) => {
	store.set("state/project/data", projects)
	store.set("state/project/loading", false)	
}

const createPopupShow = () => {
	store.set("state/project/create", {
		name: "Project"
	})
}

const createPopupClose = () => {
	store.set("state/project/create", null)
}

export { create, remove, rename, open, load, fetch, createPopupShow, createPopupClose }