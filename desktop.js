const electron = require("electron")
const path = require("path")
const url = require("url")

const app = electron.app
const BrowserWindow = electron.BrowserWindow

const createWindow = function() {
	const win = new BrowserWindow({ 
		width: 1300, 
		height: 820,
		backgroundColor: "#fff",
        webPreferences: {
            nodeIntegration: true
        }
	})
	win.setMenuBarVisibility(false)
	win.loadURL(
		url.format({
			pathname: path.join(__dirname, "index.html"),
			protocol: "file:",
			slashes: true
		}))

	win.on("closed", () => {})
}

app.on("ready", createWindow)
app.on("window-all-closed", () => {
	app.quit()
})