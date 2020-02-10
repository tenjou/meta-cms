import { store } from "wabi"
import SchemaService from "./SchemaService"
import FileSystem from "../fs/FileSystem"
import Commander from "../Commander"
import Utils from "../Utils"

const defaultFileName = "cms.json"
let activeProject = null
let activeDirectory = ""

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
				directory: "",
				minify: false,
				production: false,
				named: false
			}
		}
	}

	if(Utils.isElectron()) {
		if(!createData.directory) {
			return
		}

		const filePath = `${createData.directory}/${defaultFileName}`

		FileSystem.write(filePath, JSON.stringify(data), (error, path) => {
			if(error) {
				console.error(error)
			}
			createPopupClose()
		})
	}
	else {
		const filePath = data.meta.id

		FileSystem.createDirectory(filePath, (error, path) => {
			if(error) {
				console.error(error)
				createPopupClose()
				return
			}
			FileSystem.write(`${filePath}/${defaultFileName}`, JSON.stringify(data), (error, path) => {
				if(error) {
					console.error(error)
				}
				createPopupClose()
			})
		})	
	}
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

const rename = (path, name) => {
	FileSystem.read(path, (error, json) => {
		if(error) {
			console.error(error)
			return
		}
		const data = JSON.parse(json)
		data.meta.name = name

		FileSystem.write(`${path}/${defaultFileName}`, JSON.stringify(data), (error) => {
			if(error) {
				console.error(error)
				return
			}
		})
	})
}

const openDirectory = () => {
	const remote = require("electron").remote
	
	remote.dialog.showOpenDialog({
		properties: [ "openDirectory" ]
	}).then((result) => {
		const path = result.filePaths[0]
		if(path) {
			const fileName = `${path}/${defaultFileName}`
			if(FileSystem.checkFile(fileName)) {
				FileSystem.read(fileName, (error, contents) => {
					if(!error) {
						const projectMeta = JSON.parse(contents)
						open(projectMeta.meta.id, path)
					}
				})
			}
		}
	})
}

const open = (projectId, directory = "", onDone = null) => {
	store.set("state/project/loading", true)

	if(!directory) {
		directory = projectId
	}

	if(activeProject) {
		if(activeProject.meta.id === projectId) {
			document.location.hash = ""
			store.set("state/project/loading", false)			
			return
		}
		unload()
	}

	location.hash = projectId	
	activeDirectory = directory

	const srcPath = `${activeDirectory}/${defaultFileName}`
	FileSystem.read(srcPath, (error, json) => {
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
		
		if(onDone) {
			onDone()
		}

		store.set("state/project/loading", false)
	})
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
	activeDirectory = ""
}

const save = () => {
	if(!activeProject) {
		return
	}

	const srcPath = `${activeDirectory}/${defaultFileName}`
	FileSystem.write(`${srcPath}.tmp`, JSON.stringify(activeProject), (error, json) => {
		if(error) {
			console.error(error)
			return
		}
		FileSystem.moveTo(`${srcPath}.tmp`, srcPath, (error) => {
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

	if(Utils.isElectron()) {
		const recent = localStorage.getItem("recent") || {}
		handleFetch(recent)
	}
	else {	
		FileSystem.readDirectory("", (error, data) => {
			if(error) {
				console.error("(Project.fetch) Error while reading root directory")
				return
			}
			fetchLocal(data, handleFetch)
		})
	}
}

const fetchLocal = (data, onDone) => {
	const num = data.length
	const projects = {}
	let numToLoad = 0

	if(num > 0) {
		for(let n = 0; n < num; n++) {
			const item = data[n]
			if(!item.isDirectory) { 
				continue 
			}

			const projectDbFile = `${item.name}/${defaultFileName}`
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
		if(numToLoad === 0) {
			if(onDone) {
				onDone(projects)
			}
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
		name: "Project",
		directory: ""
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
			if(!asset.cache) {
				asset.cache = SchemaService.createCache()
				asset.cache.schema = asset.meta.schema
				asset.cache.schemaCache = SchemaService.createSchemaCache(asset.meta.schema)
				fillCache(data)
			}

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

export default { 
	create, remove, rename, open, openDirectory, unload, save, fetch, createPopupShow, createPopupClose,
	importJson 
}