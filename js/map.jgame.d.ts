declare module jgmap {
    class MapConfig {
        public tile: jg.CommonSize;
        public map: jg.CommonSize;
    }
    interface MapChip {
        autoTile: boolean;
        image: any;
    }
    class MapEditor extends jg.Scene {
        private config;
        public tile: jg.Tile;
        public no_move: boolean;
        public chips: jg.Sprite[];
        public focus: number;
        public loaded: jg.Trigger;
        public images: MapChip[];
        constructor(game: jg.Game, config: MapConfig);
        public addLayer(): void;
        public removeLayer(index: number): void;
        public updateConfig(): void;
        public dump(data?: number[][]): string;
        public _addChip(img: HTMLImageElement, autoTile?: boolean): void;
        public addChip(f: File): void;
        public changeChip(point: jg.CommonOffset): void;
        public onPointDown(e: jg.InputPointEvent): void;
        public onPointMove(e: jg.InputPointEvent): void;
        public onPointUp(e: jg.InputPointEvent): void;
    }
}
declare module jgmap {
    var scene: MapEditor;
    var config: MapConfig;
    var game: jg.Game;
    function change_chip(e): void;
    function change_map_size(): void;
    function change_tile_size(): void;
    function update_map_chips(f): void;
}
