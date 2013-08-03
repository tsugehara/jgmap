module jgmap {
	export class MapConfig {
		tile: jg.CommonSize;
		map: jg.CommonSize;
	}

	export interface MapChip {
		autoTile: boolean;
		image: any;
	}

	export class MapEditor extends jg.Scene {
		tile: jg.Tile;
		no_move: boolean;
		chips: jg.Sprite[];
		focus: number;
		loaded: jg.Trigger;
		images: MapChip[];

		constructor(game:jg.Game, private config:MapConfig) {
			super(game);
			this.tile = new jg.Tile(null, this.config.tile.width, this.config.tile.height);
			this.tile.clear(this.config.map.width, this.config.map.height);

			this.enablePointingEvent();
			this.pointDown.handle(this, this.onPointDown);
			this.pointMove.handle(this, this.onPointMove);
			this.pointUp.handle(this, this.onPointUp);

			this.chips = [];
			this.loaded = new jg.Trigger();
			this.images = [];
			
			this.append(this.tile);
		}

		addLayer() {

		}
		removeLayer(index: number) {

		}

		updateConfig() {
			var data = this.tile.data;
			this.tile.remove();
			this.tile = new jg.Tile(null, this.config.tile.width, this.config.tile.height);
			this.tile.clear(this.config.map.width, this.config.map.height);
			for (var x=0; x<this.tile.data.length; x++) {
				if (x >= data.length)
					continue;
				for (var y=0; y<this.tile.data[x].length; y++) {
					if (y >= data[x].length)
						continue;
					this.tile.data[x][y] = data[x][y];
				}
			}
			for (var i=0; i<this.images.length; i++) {
				this.tile.addChipSet(
					this.images[i].image,
					{
						autoTile: this.images[i].autoTile
					}
				);
			}
			this.tile.refresh();
			this.append(this.tile);
			this.chips = this.tile.getChips();
			this.loaded.fire();
		}

		dump(data?:number[][]) {
			if (data === undefined)
				data = this.tile.data;
			var lines:string[] = [];
			for (var x=0; x<this.config.map.width; x++) {
				var row = [];
				for (var y=0; y<this.config.map.height; y++) {
					row.push(data[x][y]);
				}
				lines.push(row.join(","));
			}
			return "[\n["+lines.join("],\n[")+"]\n]";
		}

		_addChip(img:HTMLImageElement, autoTile?:boolean) {
			this.images.push({
				image: img,
				autoTile: autoTile
			});
			this.tile.addChipSet(img, {
				autoTile: autoTile
			});
			this.chips = this.tile.getChips();
		}

		addChip(f:File) {
			var extPos = f.name.lastIndexOf(".");
			if (extPos < 0)
				return;
			var ext = f.name.substr(extPos+1).toLowerCase();
			if (ext != "jpg" && ext != "png" && ext != "gif")
				return;
			
			//TODO: オートタイルかどうかどうやって判別する？
			var autoTile = false;
			if (f.name.substr(0, 1) == "_") {
				autoTile = true;
			}
			
			var reader:FileReader = new FileReader();
			reader.onload = (file_event) => {
				var img = document.createElement("img");
				img.src = file_event.target.result;
				this._addChip(img, autoTile);
				this.tile.refresh();
				this.loaded.fire(f.name);
			}
			reader.readAsDataURL(f);
		}

		changeChip(point:jg.CommonOffset) {
			if (this.chips.length == 0)
				return;
			var p = {
				x: Math.floor(point.x / this.config.tile.width),
				y: Math.floor(point.y / this.config.tile.height)
			}
			if (p.x < 0 || p.x >= this.config.map.width || p.y < 0 || p.y >= this.config.map.height)
				return;
			this.tile.data[p.x][p.y] = this.focus;
			for (var x=p.x-1; x<=p.x+1; x++) {
				for (var y=p.y-1; y<=p.y+1; y++) {
					if (x >= 0 && x < this.config.map.width && y >= 0 && y < this.config.map.height)
						this.tile.drawChip(x, y, true);
				}
			}
			this.tile.updated();
			//this.tile.refresh();
		}

		onPointDown(e:jg.InputPointEvent) {
			if (e.entity == this.root) {
				this.no_move = true;
				this.changeChip(e);
			}
		}

		onPointMove(e:jg.InputPointEvent) {
			if (e.entity == this.root) {
				this.no_move = false;
				this.changeChip(e);
			}
		}

		onPointUp(e:jg.InputPointEvent) {
			if (this.no_move) {
				return;
			}

			//TODO: draw
		}
	}
}


