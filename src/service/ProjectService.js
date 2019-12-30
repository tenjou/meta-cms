import { store } from "wabi"
import SchemaService from "./SchemaService"
import FileSystem from "../fs/FileSystem"
import Commander from "../Commander"
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
		cache: {
			assets: {
				selected: null,
				opened: null
			},
			export: {
				minify: false,
				production: false,
				named: false
			}
		}
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
	if(activeProject) {
		if(activeProject.meta.id === projectId) {
			return
		}
	}
	location.hash = id
	load()
}

const load = (onLoad) => {
	store.set("state/project/loading", true)

	const url = document.location.hash.slice(1)
	const segments = url.split("/")
	if(url.length > 0) {
		const projectId = segments[0]
		const assetId = (segments.length > 1) ? segments[1] : null
		if(activeProject) {
			if(activeProject.meta.id === projectId) {
				return
			}
			unload()
		}

		FileSystem.read(`${projectId}/db.json`, (error, json) => {
			if(error) {
				console.error(error)
				return
			}	
			
			const data = JSON.parse(json)
			store.set("meta", data.meta)
			store.set("assets", data.assets)
			store.set("cache", data.cache)
			activeProject = data

			loadBuffers()

			if(assetId) {
				const asset = store.get(`assets/${assetId}`)
				if(asset) {
					document.location.hash = `${projectId}/${assetId}`
					store.set("cache/assets/selected", assetId)
				}	
			}			

			store.set("state/project/loading", false)
		})
	}
	else {
		document.location.hash = ""
		store.set("state/project/loading", false)
	}
}

const loadBuffers = () => {
	const assets = store.data.assets
	for(let key in assets) {
		const asset = assets[key]
		SchemaService.loadBuffer(asset)
	}
}

const unload = () => {
	save()
	activeProject = null
}

const save = () => {
	if(!activeProject) {
		return
	}
	const rootPath = activeProject.meta.id
	FileSystem.write(`${rootPath}/db.temp.json`, JSON.stringify(activeProject), (error, json) => {
		if(error) {
			console.error(error)
			return
		}
		FileSystem.moveTo(`${rootPath}/db.temp.json`, `${rootPath}/db.json`, (error) => {
			if(error) {
				console.error(error)
				return
			}
			console.log("saved")
		})
	})
}

const fetch = () => {
	store.set("state/project/loading", true)

	if(!window.electron) {
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

			FileSystem.read(projectDbFile, (error, json) => {
				if(error) {
					console.warn("(Project.fetchLocal) Error while reading project db file:", projectDbFile)
				}
				else {
					try {
						const data = JSON.parse(json)
						projects[item.name] = data
					}
					catch(error) {

					}
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

const importJson = (json) => {
    try {
        const imported = JSON.parse(json)
        store.set("buffers", {})

        const assets = imported.assets
        for(let key in assets) {
            const asset = assets[key]
            const data = asset.data
            asset.meta.schemaCache = SchemaService.createSchemaCache(asset.meta.schema)
            fillCache(data)
            SchemaService.updateBuffer(asset)
		}

		store.set("assets", imported.assets)
        
		Commander.flush()
		
		activeProject = {
			meta: activeProject.meta,
			assets: store.data.assets,
			cache: store.data.cache
		}
		save()
    }
    catch(error) {
        console.error(error)
    }
}

const fillCache = (data) => {
    for(let n = 0; n < data.length; n++) {
        const item = data[n]
        for(let key in item) {
            const property = item[key]
            if(Array.isArray(property)) {
                fillCache(property)
            }
        }
        item.__cache = SchemaService.createCache()   
    }    
}

export { create, remove, rename, open, load, unload, save, fetch, createPopupShow, createPopupClose,
	importJson }