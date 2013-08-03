var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var jgmap;
(function (jgmap) {
    var MapConfig = (function () {
        function MapConfig() {
        }
        return MapConfig;
    })();
    jgmap.MapConfig = MapConfig;

    var MapEditor = (function (_super) {
        __extends(MapEditor, _super);
        function MapEditor(game, config) {
            _super.call(this, game);
            this.config = config;
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
        MapEditor.prototype.addLayer = function () {
        };
        MapEditor.prototype.removeLayer = function (index) {
        };

        MapEditor.prototype.updateConfig = function () {
            var data = this.tile.data;
            this.tile.remove();
            this.tile = new jg.Tile(null, this.config.tile.width, this.config.tile.height);
            this.tile.clear(this.config.map.width, this.config.map.height);
            for (var x = 0; x < this.tile.data.length; x++) {
                if (x >= data.length)
                    continue;
                for (var y = 0; y < this.tile.data[x].length; y++) {
                    if (y >= data[x].length)
                        continue;
                    this.tile.data[x][y] = data[x][y];
                }
            }
            for (var i = 0; i < this.images.length; i++) {
                this.tile.addChipSet(this.images[i].image, {
                    autoTile: this.images[i].autoTile
                });
            }
            this.tile.refresh();
            this.append(this.tile);
            this.chips = this.tile.getChips();
            this.loaded.fire();
        };

        MapEditor.prototype.dump = function (data) {
            if (data === undefined)
                data = this.tile.data;
            var lines = [];
            for (var x = 0; x < this.config.map.width; x++) {
                var row = [];
                for (var y = 0; y < this.config.map.height; y++) {
                    row.push(data[x][y]);
                }
                lines.push(row.join(","));
            }
            return "[\n[" + lines.join("],\n[") + "]\n]";
        };

        MapEditor.prototype._addChip = function (img, autoTile) {
            this.images.push({
                image: img,
                autoTile: autoTile
            });
            this.tile.addChipSet(img, {
                autoTile: autoTile
            });
            this.chips = this.tile.getChips();
        };

        MapEditor.prototype.addChip = function (f) {
            var _this = this;
            var extPos = f.name.lastIndexOf(".");
            if (extPos < 0)
                return;
            var ext = f.name.substr(extPos + 1).toLowerCase();
            if (ext != "jpg" && ext != "png" && ext != "gif")
                return;

            var autoTile = false;
            if (f.name.substr(0, 1) == "_") {
                autoTile = true;
            }

            var reader = new FileReader();
            reader.onload = function (file_event) {
                var img = document.createElement("img");
                img.src = file_event.target.result;
                _this._addChip(img, autoTile);
                _this.tile.refresh();
                _this.loaded.fire(f.name);
            };
            reader.readAsDataURL(f);
        };

        MapEditor.prototype.changeChip = function (point) {
            if (this.chips.length == 0)
                return;
            var p = {
                x: Math.floor(point.x / this.config.tile.width),
                y: Math.floor(point.y / this.config.tile.height)
            };
            if (p.x < 0 || p.x >= this.config.map.width || p.y < 0 || p.y >= this.config.map.height)
                return;
            this.tile.data[p.x][p.y] = this.focus;
            for (var x = p.x - 1; x <= p.x + 1; x++) {
                for (var y = p.y - 1; y <= p.y + 1; y++) {
                    if (x >= 0 && x < this.config.map.width && y >= 0 && y < this.config.map.height)
                        this.tile.drawChip(x, y, true);
                }
            }
            this.tile.updated();
        };

        MapEditor.prototype.onPointDown = function (e) {
            if (e.entity == this.root) {
                this.no_move = true;
                this.changeChip(e);
            }
        };

        MapEditor.prototype.onPointMove = function (e) {
            if (e.entity == this.root) {
                this.no_move = false;
                this.changeChip(e);
            }
        };

        MapEditor.prototype.onPointUp = function (e) {
            if (this.no_move) {
                return;
            }
        };
        return MapEditor;
    })(jg.Scene);
    jgmap.MapEditor = MapEditor;
})(jgmap || (jgmap = {}));
var jgmap;
(function (jgmap) {
    jgmap.scene;
    jgmap.config;
    jgmap.game;
    function change_chip(e) {
        $("#toolbar").find(".chip-active").removeClass("chip-active");
        $(e.delegateTarget).addClass("chip-active");
        jgmap.scene.focus = $(e.delegateTarget).data("index");
    }
    jgmap.change_chip = change_chip;
    function change_map_size() {
        var w = parseInt($("#map_width").val());
        var h = parseInt($("#map_height").val());
        if (!w || !h || w < 1 || h < 1)
            return;
        jgmap.config.map.width = w;
        jgmap.config.map.height = h;
        jgmap.scene.updateConfig();
    }
    jgmap.change_map_size = change_map_size;
    function change_tile_size() {
        var w = parseInt($("#tile_width").val());
        var h = parseInt($("#tile_height").val());
        if (!w || !h || w < 1 || h < 1)
            return;

        jgmap.game.r("dummy").width = w;
        jgmap.game.r("dummy").height = h;

        jgmap.config.tile.width = w;
        jgmap.config.tile.height = h;
        jgmap.scene.updateConfig();
    }
    jgmap.change_tile_size = change_tile_size;
    function update_map_chips(f) {
        var toolbar = $("#toolbar");
        var active_index = toolbar.find(".chip-active").data("index");
        if (!active_index)
            active_index = 0;
        toolbar.html("");
        var chips = jgmap.scene.chips;
        for (var i = 0; i < chips.length; i++) {
            var image = chips[i].image.toDataURL();
            var img = $("<img/>").attr("src", image);
            var div = $("<div/>").addClass("chip").append(img).click(change_chip).data("index", i);
            if (active_index == i)
                div.addClass("chip-active");

            toolbar.append(div);
        }
        toolbar.append($("<div/>").addClass("c"));
    }
    jgmap.update_map_chips = update_map_chips;
    window.addEventListener("load", function () {
        jgmap.game = new jg.Game(480, 480);
        jgmap.game.preload({
            dummy: "dummy.png"
        });
        jgmap.config = new jgmap.MapConfig();
        jgmap.config.tile = {
            width: 16,
            height: 16
        };
        jgmap.config.map = {
            width: 30,
            height: 30
        };
        jgmap.game.enablePointHandler();
        jgmap.game.loaded.handle(function () {
            jgmap.scene = new jgmap.MapEditor(jgmap.game, jgmap.config);
            jgmap.scene.loaded.handle(update_map_chips);
            jgmap.game.changeScene(jgmap.scene);
            jgmap.scene._addChip(jgmap.game.r("dummy"));
            jgmap.scene.tile.refresh();
            update_map_chips("dummy");
            jgmap.scene.focus = 0;
        });

        $("#toolbar").on("dragover", function (e) {
            e.preventDefault();
        }).on("dragenter", function (e) {
            e.preventDefault();
        }).on("dragleave", function (e) {
            e.preventDefault();
        }).on("drop", function (e) {
            e.preventDefault();
            var files = e.originalEvent.dataTransfer.files;
            for (var i = 0; i < files.length; i++)
                jgmap.scene.addChip(files[i]);
        });

        $("#outbtn").click(function (e) {
            var data = jgmap.scene.tile.data;
            if ($("#out-transpose").is(":checked"))
                data = jg.JGUtil.transpose(data);
            $("#out-box").val(jgmap.scene.dump(data));
        });

        $("#map_width").val(jgmap.config.map.width.toString()).change(change_map_size);
        $("#map_height").val(jgmap.config.map.height.toString()).change(change_map_size);
        $("#tile_width").val(jgmap.config.tile.width.toString()).change(change_tile_size);
        $("#tile_height").val(jgmap.config.tile.height.toString()).change(change_tile_size);
    }, false);
})(jgmap || (jgmap = {}));
