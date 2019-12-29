import MenuService from "../service/MenuService"
import AssetService from "../service/AssetService"

MenuService.register("assets", [
	{
		type: "category",
		name: "Create",
		index: 100,
		children: [
			{
				name: "Folder",
				icon: "fa-folder",
				func() {
					Assets.createAsset("Folder", null)
				}
			},
			{
				name: "Sheet",
				icon: "fas fa-database",
				func() {
					Assets.createAsset("Sheet", null)
				}			
			}			
		]
	}
])

MenuService.register("assets.item", [
	{
		name: "actions",
		type: "category",
		children: [
			{
				name: "Delete",
				icon: "fa-trash",
				func() {
					if(confirm("Are you sure you want to delete this asset?")) {
						AssetService.remove(store.data.state.contextmenu.data)
					}
				}
			}
		]
	}
])