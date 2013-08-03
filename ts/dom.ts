module jgmap {
	export var scene:MapEditor;
	export var config:MapConfig;
	export var game:jg.Game;
	export function change_chip(e) {
		$("#toolbar").find(".chip-active").removeClass("chip-active");
		$(e.delegateTarget).addClass("chip-active");
		scene.focus = $(e.delegateTarget).data("index");
	}
	export function change_map_size() {
		var w = parseInt($("#map_width").val());
		var h = parseInt($("#map_height").val());
		if (!w || !h || w < 1 || h < 1)
			return;
		config.map.width = w;
		config.map.height = h;
		scene.updateConfig();
	}
	export function change_tile_size() {
		var w = parseInt($("#tile_width").val());
		var h = parseInt($("#tile_height").val());
		if (!w || !h || w < 1 || h < 1)
			return;

		game.r("dummy").width = w;
		game.r("dummy").height = h;

		config.tile.width = w;
		config.tile.height = h;
		scene.updateConfig();
	}
	export function update_map_chips(f) {
		var toolbar = $("#toolbar");
		var active_index = toolbar.find(".chip-active").data("index");
		if (!active_index) 
			active_index = 0;
		toolbar.html("");
		var chips = scene.chips;
		for (var i=0; i<chips.length; i++) {
			var image = chips[i].image.toDataURL();
			var img = $("<img/>").attr("src", image);
			var div = $("<div/>").addClass("chip").append(
				img
			).click(change_chip).data("index", i);
			if (active_index == i)
				div.addClass("chip-active");

			toolbar.append(div);
		}
		toolbar.append(
			$("<div/>").addClass("c")
		);
	}
	window.addEventListener("load", () => {
		game = new jg.Game(480, 480);
		game.preload({
			dummy: "dummy.png"
		});
		config = new MapConfig();
		config.tile = {
			width: 16,
			height: 16
		}
		config.map = {
			width: 30,
			height: 30
		}
		game.enablePointHandler();
		game.loaded.handle(() => {
			scene = new MapEditor(game, config);
			scene.loaded.handle(update_map_chips);
			game.changeScene(scene);
			scene._addChip(game.r("dummy"));
			scene.tile.refresh();
			update_map_chips("dummy");
			scene.focus = 0;
		});

		$("#toolbar").on("dragover", (e) => {
			e.preventDefault();
		}).on("dragenter", (e) => {
			e.preventDefault();
		}).on("dragleave", (e) => {
			e.preventDefault();
		}).on("drop", (e) => {
			e.preventDefault();
			var files = e.originalEvent.dataTransfer.files;
			for (var i=0; i<files.length; i++)
				scene.addChip(files[i]);
		});

		$("#outbtn").click((e) => {
			var data = scene.tile.data;
			if ($("#out-transpose").is(":checked"))
				data = jg.JGUtil.transpose(data);
			$("#out-box").val(scene.dump(data));
		});

		$("#map_width").val(config.map.width.toString()).change(change_map_size);
		$("#map_height").val(config.map.height.toString()).change(change_map_size);
		$("#tile_width").val(config.tile.width.toString()).change(change_tile_size);
		$("#tile_height").val(config.tile.height.toString()).change(change_tile_size);

	}, false);
}
