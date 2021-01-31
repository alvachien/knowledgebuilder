
/**
 * UI mode
 */
export enum UIMode {
  ListView = 0,
  Create = 1,
  Update = 2,
  Display = 3
}

/**
  * Date range
  */
export enum StatisticsDateRangeEnum {
  CurrentMonth = 1,
  PreviousMonth = 2,
  CurrentYear = 3,
  PreviousYear = 4,
  All = 5
}

/**
 * Group of nav. item
 */
export enum AppNavItemGroupEnum {
  home = 0,
  ps_basic  = 1,
  ps_extend = 2,
  games = 3,
  award = 4,
  report = 5,
  help = 6,
  knowledge = 7,
  others = 10
}

/**
  * Nav. item
  */
export interface AppNavItem {
  name: string;
  route: string;
  group: AppNavItemGroupEnum;
}

/**
  * App. language
  */
export interface AppLanguage {
  displayas: string;
  value: string;
}

/**
 * Position of mouse event in Canvas
 */
export interface CanvasMousePositionInf {
  x: number;
  y: number;
}

/**
 * Get canvas mouse event position
 * @param canvas Canvas
 * @param evt Event
 */
export function getCanvasMouseEventPosition(canvas: any, evt: MouseEvent): CanvasMousePositionInf {
  const x: any = evt.clientX;
  const y: any = evt.clientY;

  // const rect = canvas.getBoundingClientRect();
  // x -= rect.left;
  // y -= rect.top;
  // return { x: x, y: y };

  // ?!!!?
  // TBD: get the difference!!!
  //
  const bbox = canvas.getBoundingClientRect();
  const x2 = (x - bbox.left) * (canvas.width / bbox.width);
  const y2 = (y - bbox.top) * (canvas.height / bbox.height);
  return { x: x2, y: y2};
}

/**
 * Cell position
 */
export interface CanvasCellPositionInf {
  row: number;
  column: number;
}

/**
 * Get canvas cell position
 * @param cavpos Position in the canvas
 * @param cellWidth Width of each cell
 * @param cellHeight Height of each cell
 */
export function getCanvasCellPosition(cavpos: CanvasMousePositionInf, cellWidth: number, cellHeight: number): CanvasCellPositionInf {
  return {
    row: Math.floor(cavpos.y / cellHeight),
    column: Math.floor(cavpos.x / cellWidth),
  };
}
