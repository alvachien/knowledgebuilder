// Constants
export const BC_Screen_Width = 512;
export const BC_Screen_Height = 448;

export const ImagePOS =  {
    "selectTank": [128, 96],
    "stageLevel": [396, 96],
    "num": [256, 96],
    "map": [0, 96],
    "home": [256, 0],
    "score": [0, 112],
    "player": [0, 0],
    "protected": [160, 96],
    "enemyBefore": [256, 32],
    "enemy1": [0, 32],
    "enemy2": [128, 32],
    "enemy3": [0, 64],
    "bullet": [80, 96],
    "tankBomb": [0, 160],
    "bulletBomb": [320, 0],
    "over": [384, 64],
    "prop": [256,110],
};

/**************游戏状态*****************/
export const GAME_STATE_MENU = 0;
export const GAME_STATE_INIT = 1;
export const GAME_STATE_START = 2;
export const GAME_STATE_OVER = 3;
export const GAME_STATE_WIN = 4;

/**************地图块*****************/
export const WALL = 1;
export const GRID = 2;
export const GRASS = 3;
export const WATER = 4;
export const ICE = 5;
export const HOME = 9;
export const ANOTHREHOME = 8;

/**************坦克及子弹的四个方向*****************/
const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

/**************坦克及子弹的四个方向*****************/
const ENEMY_LOCATION = [192,0,384]; //相对与主游戏区

/**************子弹类型*****************/
const BULLET_TYPE_PLAYER = 1;
const BULLET_TYPE_ENEMY = 2;
/**************爆炸类型****************/
const CRACK_TYPE_TANK = "tank";
const CRACK_TYPE_BULLET = "bullet";

// Global runtime context
export class BattleCityGlobalContext {
    // static 
    static imageMenu: HTMLImageElement;
    static imageResource: HTMLImageElement;

    static menu: BattleCityMenu;
    static stage: BattleCityStage;
    static map: BattleCityMap | null = null;
    static player1: BattleCityPlayTank | null; //玩家1
    static player2: BattleCityPlayTank | null; //玩家2

    static enemyArray: BattleCityEnemyTank[] = []; //敌方坦克
    static bulletArray: BattleCityBullet[] = []; //子弹数组
    static keys = []; //记录按下的按键
    static crackArray = []; //爆炸数组
    static gameState = GAME_STATE_MENU;//默认菜单状态
    static level = 1;
    static maxEnemy = 20;//敌方坦克总数
    static maxAppearEnemy = 5;//屏幕上一起出现的最大数
    static appearEnemy = 0; //已出现的敌方坦克
    static mainframe = 0;
    static isGameOver = false;
    static overX = 176;
    static overY = 384;
    static emenyStopTime = 0;
    static homeProtectedTime = -1;
    static propTime = 300;        

    /**
     * 检测2个物体是否碰撞
     * @param object1 物体1
     * @param object2 物体2
     * @param overlap 允许重叠的大小
     * @returns {Boolean} 如果碰撞了，返回true
     */
    static CheckIntersect(object1: any, object2: any, overlap: any)
    {
        //    x-轴                      x-轴
        //  A1------>B1 C1              A2------>B2 C2
        //  +--------+   ^              +--------+   ^
        //  | object1|   | y-轴         | object2|   | y-轴
        //  |        |   |              |        |   |
        //  +--------+  D1              +--------+  D2
        //
        // overlap是重叠的区域值
        const A1 = object1.x + overlap;
        const B1 = object1.x + object1.size - overlap;
        const C1 = object1.y + overlap;
        const D1 = object1.y + object1.size - overlap;
    
        const A2 = object2.x + overlap;
        const B2 = object2.x + object2.size - overlap;
        const C2 = object2.y + overlap;
        const D2 = object2.y + object2.size - overlap;
    
        //假如他们在x-轴重叠
        if(A1 >= A2 && A1 <= B2
        || B1 >= A2 && B1 <= B2)
        {
            //判断y-轴重叠
            if(C1 >= C2 && C1 <= D2 || D1 >= C2 && D1 <= D2)
            {
                return true;
            }
        }
        return false;
    }

    /**
     * 坦克与地图块碰撞
     * @param tank 坦克对象
     * @param mapobj 地图对象
     * @returns {Boolean} 如果碰撞，返回true
    */
    static tankMapCollision(tank: BattleCityTank, mapobj: BattleCityMap){
        //移动检测，记录最后一次的移动方向，根据方向判断+-overlap,
        let tileNum = 0;//需要检测的tile数
        let rowIndex = 0;//map中的行索引
        let colIndex = 0;//map中的列索引
        let overlap = 3;//允许重叠的大小
	
        //根据tank的x、y计算出map中的row和col
        if(tank.dir == UP){
            // rowIndex = parseInt((tank.tempY + overlap  - mapobj.offsetY) / mapobj.tileSize);
            // colIndex = parseInt((tank.tempX + overlap- mapobj.offsetX) / mapobj.tileSize);
            rowIndex = Math.floor((tank.tempY + overlap  - mapobj.offsetY) / mapobj.tileSize);
            colIndex = Math.floor((tank.tempX + overlap- mapobj.offsetX) / mapobj.tileSize);
        }else if(tank.dir == DOWN){
            // 向下，即dir==1的时候，行索引的计算需要+tank.Height
            // rowIndex = parseInt((tank.tempY - overlap - mapobj.offsetY + tank.size)/mapobj.tileSize);
            // colIndex = parseInt((tank.tempX + overlap- mapobj.offsetX)/mapobj.tileSize);
            rowIndex = Math.floor((tank.tempY - overlap - mapobj.offsetY + tank.size) / mapobj.tileSize);
            colIndex = Math.floor((tank.tempX + overlap- mapobj.offsetX)/mapobj.tileSize);
        }else if(tank.dir == LEFT){
            // rowIndex = parseInt((tank.tempY + overlap- mapobj.offsetY)/mapobj.tileSize);
            // colIndex = parseInt((tank.tempX + overlap - mapobj.offsetX)/mapobj.tileSize);
            rowIndex = Math.floor((tank.tempY + overlap- mapobj.offsetY)/mapobj.tileSize);
            colIndex = Math.floor((tank.tempX + overlap - mapobj.offsetX)/mapobj.tileSize);
        }else if(tank.dir == RIGHT){
            // rowIndex = parseInt((tank.tempY + overlap- mapobj.offsetY)/mapobj.tileSize);
            rowIndex = Math.floor((tank.tempY + overlap- mapobj.offsetY)/mapobj.tileSize);
            //向右，即dir==3的时候，列索引的计算需要+tank.Height
            // colIndex = parseInt((tank.tempX - overlap - mapobj.offsetX + tank.size)/mapobj.tileSize);
            colIndex = Math.floor((tank.tempX - overlap - mapobj.offsetX + tank.size)/mapobj.tileSize);
        }
        if(rowIndex >= mapobj.HTileCount || rowIndex < 0 || colIndex >= mapobj.wTileCount || colIndex < 0){
            return true;
        }
        if(tank.dir == UP || tank.dir == DOWN){
            // var tempWidth = parseInt(tank.tempX - map.offsetX - (colIndex)*mapobj.tileSize + tank.size - overlap);//去除重叠部分
            let tempWidth = Math.floor(tank.tempX - BattleCityGlobalContext.map!.offsetX - (colIndex)*mapobj.tileSize + tank.size - overlap);//去除重叠部分
            if(tempWidth % mapobj.tileSize == 0 ){
                // tileNum = parseInt(tempWidth/mapobj.tileSize);
                tileNum = Math.floor(tempWidth/mapobj.tileSize);
            }else{
                // tileNum = parseInt(tempWidth/mapobj.tileSize) + 1;
                tileNum = Math.floor(tempWidth/mapobj.tileSize) + 1;
            }
            for(let i = 0; i < tileNum && colIndex + i < mapobj.wTileCount ;i++){
                let mapContent = mapobj.mapLevel![rowIndex][colIndex+i];
                if(mapContent == WALL || mapContent == GRID || mapContent == WATER || mapContent == HOME || mapContent == ANOTHREHOME){
                    if(tank.dir == UP){
                        tank.y = mapobj.offsetY + rowIndex * mapobj.tileSize + mapobj.tileSize - overlap;
                    }else if(tank.dir == DOWN){
                        tank.y = mapobj.offsetY + rowIndex * mapobj.tileSize - tank.size + overlap;
                    }
                    return true;
                }
            }
        }else{
            // var tempHeight = parseInt(tank.tempY - map.offsetY - (rowIndex)*mapobj.tileSize + tank.size - overlap);//去除重叠部分
            let tempHeight = Math.floor(tank.tempY - BattleCityGlobalContext.map!.offsetY - (rowIndex)*mapobj.tileSize + tank.size - overlap);//去除重叠部分
            if(tempHeight % mapobj.tileSize === 0 ){
                //tileNum = parseInt(tempHeight/mapobj.tileSize);
                tileNum = Math.floor(tempHeight / mapobj.tileSize);
            } else {
                // tileNum = parseInt(tempHeight/mapobj.tileSize) + 1;
                tileNum = Math.floor(tempHeight / mapobj.tileSize) + 1;
            }
            for(var i=0;i<tileNum && rowIndex+i < mapobj.HTileCount;i++){
                // var mapContent = mapobj.mapLevel[rowIndex+i][colIndex];
                let mapContent = mapobj.mapLevel![rowIndex+i][colIndex];
                if(mapContent === WALL || mapContent === GRID || mapContent === WATER || mapContent === HOME || mapContent === ANOTHREHOME){
                    if(tank.dir === LEFT){
                        tank.x = mapobj.offsetX + colIndex * mapobj.tileSize + mapobj.tileSize - overlap;
                    }else if(tank.dir === RIGHT){
                        tank.x = mapobj.offsetX + colIndex * mapobj.tileSize - tank.size + overlap;
                    }
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 子弹与地图块的碰撞
     * @param bullet 子弹对象
     * @param mapobj 地图对象
     */
    static bulletMapCollision(bullet: BattleCityBullet, mapobj: BattleCityMap){
        let tileNum = 0;//需要检测的tile数
        let rowIndex = 0;//map中的行索引
        let colIndex = 0;//map中的列索引
        let mapChangeIndex = [];//map中需要更新的索引数组
        let result = false;//是否碰撞
	    // 根据bullet的x、y计算出map中的row和col
	    if(bullet.dir == UP){
            // rowIndex = parseInt((bullet.y - mapobj.offsetY)/mapobj.tileSize);
            // colIndex = parseInt((bullet.x - mapobj.offsetX)/mapobj.tileSize);
            rowIndex = Math.floor((bullet.y - mapobj.offsetY)/mapobj.tileSize);
            colIndex = Math.floor((bullet.x - mapobj.offsetX)/mapobj.tileSize);
        }else if(bullet.dir == DOWN){
            //向下，即dir==1的时候，行索引的计算需要+bullet.Height
            // rowIndex = parseInt((bullet.y - mapobj.offsetY + bullet.size)/mapobj.tileSize);
            // colIndex = parseInt((bullet.x - mapobj.offsetX)/mapobj.tileSize);
            rowIndex = Math.floor((bullet.y - mapobj.offsetY + bullet.size)/mapobj.tileSize);
            colIndex = Math.floor((bullet.x - mapobj.offsetX)/mapobj.tileSize);
        }else if(bullet.dir == LEFT){
            // rowIndex = parseInt((bullet.y - mapobj.offsetY)/mapobj.tileSize);
            // colIndex = parseInt((bullet.x - mapobj.offsetX)/mapobj.tileSize);
            rowIndex = Math.floor((bullet.y - mapobj.offsetY)/mapobj.tileSize);
            colIndex = Math.floor((bullet.x - mapobj.offsetX)/mapobj.tileSize);
        }else if(bullet.dir == RIGHT){
            // rowIndex = parseInt((bullet.y - mapobj.offsetY)/mapobj.tileSize);
            rowIndex = Math.floor((bullet.y - mapobj.offsetY)/mapobj.tileSize);
            //向右，即dir==3的时候，列索引的计算需要+bullet.Height
            // colIndex = parseInt((bullet.x - mapobj.offsetX + bullet.size)/mapobj.tileSize);
            colIndex = Math.floor((bullet.x - mapobj.offsetX + bullet.size)/mapobj.tileSize);
        }
        if(rowIndex >= mapobj.HTileCount || rowIndex < 0 || colIndex >= mapobj.wTileCount || colIndex < 0){
            return true;
        }
	
        if(bullet.dir == UP || bullet.dir == DOWN){
            // var tempWidth = parseInt(bullet.x - map.offsetX - (colIndex)*mapobj.tileSize + bullet.size);
            let tempWidth = Math.floor(bullet.x - mapobj.offsetX - (colIndex)*mapobj.tileSize + bullet.size);
            if(tempWidth % mapobj.tileSize == 0 ){
                // tileNum = parseInt(tempWidth/mapobj.tileSize);
                tileNum = Math.floor(tempWidth / mapobj.tileSize);
            } else {
                // tileNum = parseInt(tempWidth/mapobj.tileSize) + 1;
                tileNum = Math.floor(tempWidth / mapobj.tileSize) + 1;
            }
            for(let i=0;i < tileNum && colIndex + i < mapobj.wTileCount ;i++){
                let mapContent = mapobj.mapLevel![rowIndex][colIndex+i];
                if(mapContent == WALL || mapContent == GRID || mapContent == HOME || mapContent == ANOTHREHOME){
                    //bullet.distroy();
                    result = true;
                    if(mapContent == WALL){
                        //墙被打掉
                        mapChangeIndex.push([rowIndex,colIndex+i]);
                    }else if(mapContent == GRID){
                        
                    }else{
                        BattleCityGlobalContext.isGameOver = true;
                        break;
                    }
                }
            }
        }else{
            // var tempHeight = parseInt(bullet.y - map.offsetY - (rowIndex)*mapobj.tileSize + bullet.size);
            let tempHeight = Math.floor(bullet.y - mapobj.offsetY - (rowIndex)*mapobj.tileSize + bullet.size);
            if(tempHeight % mapobj.tileSize === 0 ){
                // tileNum = parseInt(tempHeight/mapobj.tileSize);
                tileNum = Math.floor(tempHeight/mapobj.tileSize);
            }else{
                // tileNum = parseInt(tempHeight/mapobj.tileSize) + 1;
                tileNum = Math.floor(tempHeight/mapobj.tileSize) + 1;
            }
            for(let i = 0; i < tileNum && rowIndex + i < mapobj.HTileCount;i++){
                let mapContent = mapobj.mapLevel![rowIndex+i][colIndex];
                if(mapContent == WALL || mapContent == GRID || mapContent == HOME || mapContent == ANOTHREHOME){
                    //bullet.distroy();
                    result = true;
                    if(mapContent == WALL){
                        // 墙被打掉
                        mapChangeIndex.push([rowIndex+i,colIndex]);
                    }else if(mapContent == GRID){
                        
                    }else{
                        BattleCityGlobalContext.isGameOver = true;
                        break;
                    }
                }
            }
        }
        //更新地图
        mapobj.updateMap(mapChangeIndex, 0);
        return result;
    }

    static initMap(){
        BattleCityGlobalContext.map!.setMapLevel(BattleCityGlobalContext.level);;
        BattleCityGlobalContext.map!.draw();
        BattleCityGlobalContext.drawLives();
    }

    static drawLives() {
        BattleCityGlobalContext.map!.drawLives(BattleCityGlobalContext.player1!.lives, 1);
        BattleCityGlobalContext.map!.drawLives(BattleCityGlobalContext.player2!.lives, 2);
    }

    static initObject(ctxStage: CanvasRenderingContext2D,
        ctxWall: CanvasRenderingContext2D,
        ctxGrass: CanvasRenderingContext2D,
        ctxTank: CanvasRenderingContext2D,
        ctxOver: CanvasRenderingContext2D) {
        BattleCityGlobalContext.menu = new BattleCityMenu(ctxStage);
        BattleCityGlobalContext.stage = new BattleCityStage(ctxStage, BattleCityGlobalContext.level);
        BattleCityGlobalContext.map = new BattleCityMap(ctxWall, ctxGrass);

        BattleCityGlobalContext.player1 = new BattleCityPlayTank(ctxTank);
        BattleCityGlobalContext.player1.x = 129 + BattleCityGlobalContext.map.offsetX;
        BattleCityGlobalContext.player1.y = 385 + BattleCityGlobalContext.map.offsetY;
        BattleCityGlobalContext.player2 = new BattleCityPlayTank(ctxTank);
        BattleCityGlobalContext.player2.offsetX = 128; //player2的图片x与图片1相距128
        BattleCityGlobalContext.player2.x = 256 + BattleCityGlobalContext.map.offsetX;
        BattleCityGlobalContext.player2.y = 385 + BattleCityGlobalContext.map.offsetY;
        BattleCityGlobalContext.appearEnemy = 0; //已出现的敌方坦克
        BattleCityGlobalContext.enemyArray = [];//敌方坦克
        BattleCityGlobalContext.bulletArray = [];//子弹数组
        BattleCityGlobalContext.keys = [];//记录按下的按键
        BattleCityGlobalContext.crackArray = [];//爆炸数组
        BattleCityGlobalContext.isGameOver = false;
        BattleCityGlobalContext.overX = 176;
        BattleCityGlobalContext.overY = 384;
        ctxOver.clearRect(0,0,BC_Screen_Width,BC_Screen_Height);
        BattleCityGlobalContext.emenyStopTime = 0;
        BattleCityGlobalContext.homeProtectedTime = -1;
        BattleCityGlobalContext.propTime = 1000;
            
    }
}

// Num
export class BattleCityNum {
    ctx: CanvasRenderingContext2D;
    size = 14;

    constructor(ctx_: CanvasRenderingContext2D) {
        this.ctx = ctx_;
    }

    draw(num: number, x: number, y: number){
		let tempX = x;
		let tempY = y;
		let tempNumArray = [];

		if(num == 0){
			tempNumArray.push(0);
		}else{
			while(num > 0){
				tempNumArray.push(num % 10);
				num = Math.floor(num / 10); // ORG: parseInt(num/10)
			}
		}
		for(let i = tempNumArray.length-1; i >= 0; i--){
			tempX = x+(tempNumArray.length-i-1) * this.size;
			this.ctx.drawImage(BattleCityGlobalContext.imageResource, 
                ImagePOS["num"][0] + tempNumArray[i]*14,
                ImagePOS["num"][1],
                this.size, this.size,tempX, tempY,this.size, this.size);
		}
	}
}

// Map
export class BattleCityMap {
	level = 1;
	mapLevel: any[] | null = null; 
	wallCtx: CanvasRenderingContext2D;
	grassCtx: CanvasRenderingContext2D;
	
	offsetX = 32; //主游戏区的X偏移量
	offsetY = 16;//主游戏区的Y偏移量
	wTileCount = 26; //主游戏区的宽度地图块数
	HTileCount = 26;//主游戏区的高度地图块数
	tileSize = 16;	//地图块的大小
	homeSize = 32; //家图标的大小
	num: BattleCityNum;
	mapWidth = 416;
	mapHeight = 416;

    constructor(wCtx: CanvasRenderingContext2D, gCtx: CanvasRenderingContext2D) {
        this.wallCtx = wCtx;
        this.grassCtx = gCtx;
        this.num = new BattleCityNum(this.wallCtx);
    }

    setMapLevel(level: number){
		this.level = level;
		let tempMap = eval("map" + this.level);
		this.mapLevel = [];
		for(let i=0; i  < tempMap.length; i++){
			this.mapLevel[i] = [];
			for(let j = 0; j < tempMap[i].length;j++){
				this.mapLevel[i][j] = tempMap[i][j];
			}
		}
	}

    draw() {
		this.wallCtx.fillStyle = "#7f7f7f";
		this.wallCtx.fillRect(0, 0, BC_Screen_Width, BC_Screen_Height);
		this.wallCtx.fillStyle = "#000";
		this.wallCtx.fillRect(this.offsetX,this.offsetY,this.mapWidth,this.mapHeight);//主游戏区

		this.grassCtx.clearRect(0, 0, BC_Screen_Width, BC_Screen_Height);
		
		for(let i = 0; i < this.HTileCount; i++){
			for(let j = 0; j < this.wTileCount; j++){
				if(this.mapLevel![i][j] === WALL || this.mapLevel![i][j] === GRID || this.mapLevel![i][j] === WATER || this.mapLevel![i][j] === ICE){
					this.wallCtx.drawImage(BattleCityGlobalContext.imageResource,
                        this.tileSize * (this.mapLevel![i][j]-1) + ImagePOS["map"][0], ImagePOS["map"][1],this.tileSize,this.tileSize,j * this.tileSize + this.offsetX, 
                        i*this.tileSize + this.offsetY,this.tileSize,this.tileSize) ;
				}else if(this.mapLevel![i][j] === GRASS){
					this.grassCtx.drawImage(BattleCityGlobalContext.imageResource,
                        this.tileSize*(this.mapLevel![i][j]-1) + ImagePOS["map"][0], ImagePOS["map"][1],this.tileSize,this.tileSize,j * this.tileSize + this.offsetX, 
                        i * this.tileSize + this.offsetY,this.tileSize,this.tileSize);
				}else if(this.mapLevel![i][j] === HOME){
					this.wallCtx.drawImage(BattleCityGlobalContext.imageResource,
                        ImagePOS["home"][0], ImagePOS["home"][1], this.homeSize, this.homeSize, j*this.tileSize + this.offsetX, i*this.tileSize + this.offsetY, 
                        this.homeSize, this.homeSize) ;
				}
			}
		}
		this.drawNoChange();
		this.drawEnemyNum(BattleCityGlobalContext.maxEnemy);
		this.drawLevel();
		this.drawLives(0,1);
		this.drawLives(0,2);
    }

	/**
	 * 画固定不变的部分
	 */
	drawNoChange() {
		this.wallCtx.drawImage(BattleCityGlobalContext.imageResource, ImagePOS["score"][0], ImagePOS["score"][1], 30, 32, 464, 256, 30, 32);//player1
		
		this.wallCtx.drawImage(BattleCityGlobalContext.imageResource, 30 + ImagePOS["score"][0], ImagePOS["score"][1], 30, 32, 464, 304, 30, 32);//player2
		//30,32旗帜的size, 464, 352旗帜在canvas中位置
		this.wallCtx.drawImage(BattleCityGlobalContext.imageResource, 60 + ImagePOS["score"][0], ImagePOS["score"][1], 30, 32, 464, 352, 32, 30);//画旗帜
	};
	
	/**
	 * 画关卡数
	 */
	drawLevel(){
		this.num!.draw(this.level, 468, 384);
	};
	
	/**
	 * 画右侧敌方坦克数
	 * @param enemyNum 地方坦克总数
	 */
	drawEnemyNum(enemyNum: number){
		let x = 466;
		let y = 34;
		let enemySize = 16;
		for(let i = 1; i <= enemyNum; i++){
			let tempX = x;
			// let tempY = y + parseInt((i+1)/2)*enemySize;
            let tempY = y + Math.floor((i + 1) / 2) * enemySize;
			if(i % 2 === 0){
				tempX = x  + enemySize;
			}
			this.wallCtx.drawImage(BattleCityGlobalContext.imageResource, 92 + ImagePOS["score"][0],
                ImagePOS["score"][1], 14, 14, tempX, tempY, 14, 14);
		}
	};
	
	/**
	 * 清除右侧敌方坦克数，从最下面开始清楚
	 * @param totolEnemyNum 敌方坦克的总数
	 * @param enemyNum 已出现的敌方坦克数
	 */
	clearEnemyNumfunction(totolEnemyNum: number, enemyNum: number){
		let x = 466;
		let y = 34 + this.offsetY;
		if(enemyNum <= 0){
			return ;
		}
		let enemySize = 16;
		this.wallCtx.fillStyle = "#7f7f7f";
		let tempX = x + (enemyNum % 2) * enemySize;
		//let tempY = y + (Math.ceil(totolEnemyNum / 2) - 1) * enemySize - (parseInt((enemyNum - 1) / 2)) * enemySize;
        let tempY = y + (Math.ceil(totolEnemyNum / 2) - 1) * enemySize - (Math.floor((enemyNum - 1) / 2)) * enemySize;
		this.wallCtx.fillRect(tempX,tempY,14,14);
	};
	
	/**
	 * 画坦克的生命数
	 * @param lives 生命数
	 * @param which 坦克索引，1、代表玩家1  2、代表玩家2
	 */
	drawLives(lives: number, which: number){
		let x = 482;
		let y = 272;
		if(which === 2){
			y = 320;
		}
		this.wallCtx.fillStyle = "#7f7f7f";
		this.wallCtx.fillRect(x,y,this.num.size,this.num.size);
		this.num.draw(lives,x,y);
		//this.wallCtx.drawImage(RESOURCE_IMAGE,POS["num"][0]+lives*14,POS["num"][1],14, 14,x, y,14, 14);
	};
	
	/**
	 * 更新地图
	 * @param indexArr 需要更新的地图索引数组，二维数组，如[[1,1],[2,2]]
	 * @param target 更新之后的数值
	 */
	updateMap(indexArr: any[], target: number){
		if(indexArr !== null && indexArr.length > 0){
			let indexSize = indexArr.length;
			for(let i = 0; i < indexSize; i++){
				let index = indexArr[i];
				this.mapLevel![index[0]][index[1]] = target;
				if(target > 0){
					this.wallCtx.drawImage(BattleCityGlobalContext.imageResource, this.tileSize * (target-1) + ImagePOS["map"][0], 
                        ImagePOS["map"][1], this.tileSize, this.tileSize, index[1] * this.tileSize + this.offsetX, 
                        index[0] * this.tileSize + this.offsetY, this.tileSize, this.tileSize) ;
				}else{
					this.wallCtx.fillStyle = "#000";
					this.wallCtx.fillRect(index[1] * this.tileSize + this.offsetX, index[0] * this.tileSize + this.offsetY, this.tileSize, this.tileSize);
				}
			}
		}
	};
	
	homeHit(){
		this.wallCtx.drawImage(BattleCityGlobalContext.imageResource, ImagePOS["home"][0] + this.homeSize, 
            ImagePOS["home"][1], this.homeSize, this.homeSize, 12*this.tileSize + this.offsetX, 24*this.tileSize + this.offsetY, this.homeSize, this.homeSize) ;
	};    
}

// Tank 
export abstract class BattleCityTank {
	x = 0;
	y = 0;
	size = 32; //坦克的大小
	dir = UP; //方向0：上 1：下 2：左3：右
	speed = 1; //坦克的速度
	frame = 0; //控制敌方坦克切换方向的时间
	hit = false; //是否碰到墙或者坦克
	isAI = false; //是否自动
	isShooting = false; //子弹是否在运行中
	bullet: BattleCityBullet | null = null; //子弹
	shootRate = 0.6; //射击的概率
	isDestroyed = false;
	tempX = 0;
	tempY = 0;

    constructor() {        
    }

    move() {
		// 如果是AI坦克，在一定时间或者碰撞之后切换方法		
		if(this.isAI && BattleCityGlobalContext.emenyStopTime > 0 ){
			return;
		}

		this.tempX = this.x;
		this.tempY = this.y;
		
		if(this.isAI){
			this.frame ++;
			if(this.frame % 100 == 0 || this.hit){
				this.dir = Math.floor((Math.random() * 4));//随机一个方向
				this.hit = false;
				this.frame = 0;
			}
		}
		if(this.dir == UP){
			this.tempY -= this.speed;
		}else if(this.dir == DOWN){
			this.tempY += this.speed;
		}else if(this.dir == RIGHT){
			this.tempX += this.speed;
		}else if(this.dir == LEFT){
			this.tempX -= this.speed;
		}
		this.isHit();
		if(!this.hit){
			this.x = this.tempX;
			this.y = this.tempY;
		}
    }

    /**
	 * 碰撞检测
	 */
	isHit(){
		// 临界检测
		if(this.dir === LEFT){
			if(this.x <= BattleCityGlobalContext.map!.offsetX){
				this.x = BattleCityGlobalContext.map!.offsetX;
				this.hit = true;
			}
		}else if(this.dir === RIGHT){
			if(this.x >= BattleCityGlobalContext.map!.offsetX + BattleCityGlobalContext.map!.mapWidth - this.size){
				this.x = BattleCityGlobalContext.map!.offsetX + BattleCityGlobalContext.map!.mapWidth - this.size;
				this.hit = true;
			}
		}else if(this.dir === UP ){
			if(this.y <= BattleCityGlobalContext.map!.offsetY){
				this.y = BattleCityGlobalContext.map!.offsetY;
				this.hit = true;
			}
		}else if(this.dir === DOWN){
			if(this.y >= BattleCityGlobalContext.map!.offsetY + BattleCityGlobalContext.map!.mapHeight - this.size){
				this.y = BattleCityGlobalContext.map!.offsetY + BattleCityGlobalContext.map!.mapHeight - this.size;
				this.hit = true;
			}
		}
		if(!this.hit){
			//地图检测
			if(BattleCityGlobalContext.tankMapCollision(this, BattleCityGlobalContext.map!)){
				this.hit = true;
			}
		}
    }

	/**
	 * 是否被击中
	 */
	isShot(){		
	};

	/**
	 * 坦克被击毁
	 */
	distroy(){
		this.isDestroyed = true;
        // TBD.
		// crackArray.push(new CrackAnimation(CRACK_TYPE_TANK,this.ctx,this));
		// TANK_DESTROY_AUDIO.play();
	}

}

export class BattleCitySelectTank extends BattleCityTank {
	ys = [250, 281]; //两个Y坐标，分别对应1p和2p
    constructor() {
        super();
        this.x = 140;
        this.size = 27;
    }
}

export class BattleCityTankWithContext extends BattleCityTank {
	ctx: CanvasRenderingContext2D;

    constructor(context: CanvasRenderingContext2D) {
        super();
        this.ctx = context;
    }

	/**
	 * 射击
	 */ 
	shoot(type: number){
		if(this.isAI && BattleCityGlobalContext.emenyStopTime > 0 ){
			return;
		}
		if(this.isShooting){
			return;
		} else {
			let tempX = this.x;
			let tempY = this.y;
			this.bullet = new BattleCityBullet(this.ctx, this, type, this.dir);
			if(this.dir == UP){
				// tempX = this.x + parseInt(this.size/2) - parseInt(this.bullet.size/2);
                tempX = this.x + Math.floor(this.size / 2) - Math.floor(this.bullet.size / 2);
				tempY = this.y - this.bullet.size;
			}else if(this.dir == DOWN){
				// tempX = this.x + parseInt(this.size/2) - parseInt(this.bullet.size/2);
                tempX = this.x + Math.floor(this.size / 2) - Math.floor(this.bullet.size / 2);
				tempY = this.y + this.size;
			}else if(this.dir == LEFT){
				tempX = this.x - this.bullet.size;
				// tempY = this.y + parseInt(this.size/2) - parseInt(this.bullet.size/2);
                tempY = this.y + Math.floor(this.size / 2) - Math.floor(this.bullet.size / 2);
			}else if(this.dir == RIGHT){
				tempX = this.x + this.size;
				// tempY = this.y + parseInt(this.size/2) - parseInt(this.bullet.size/2);
                tempY = this.y + Math.floor(this.size / 2) - Math.floor(this.bullet.size / 2);
			}
			this.bullet.x = tempX;
			this.bullet.y = tempY;
			if(!this.isAI){
                // TBD.
				// ATTACK_AUDIO.play();
			}
			this.bullet.draw();
			// 将子弹加入的子弹数组中
			BattleCityGlobalContext.bulletArray.push(this.bullet);
			this.isShooting = true;
		}
	}
}

export class BattleCityPlayTank extends BattleCityTankWithContext {
	lives = 3; //生命值
	isProtected = true; //是否受保护
	protectedTime = 500; //保护时间
	offsetX = 0; //坦克2与坦克1的距离

    constructor(context: CanvasRenderingContext2D) {
        super(context);
        this.speed = 2;
        this.ctx = context;
    }

    draw() {
		this.hit = false;
		this.ctx.drawImage(BattleCityGlobalContext.imageResource,
            ImagePOS["player"][0] + this.offsetX + this.dir * this.size,
            ImagePOS["player"][1], this.size, this.size, this.x, this.y, this.size, this.size);
		if(this.isProtected){
			//var temp = parseInt((500 - this.protectedTime)/5)%2;
            let temp = Math.floor((500 - this.protectedTime) / 5) % 2;
			this.ctx.drawImage(BattleCityGlobalContext.imageResource,
                ImagePOS["protected"][0],
                ImagePOS["protected"][1] + 32 * temp, 32, 32, this.x, this.y, 32, 32);
			this.protectedTime--;
			if(this.protectedTime == 0){
				this.isProtected = false;
			}
		}
		
	}
	
	override distroy() {
		this.isDestroyed = true;
        // TBD.
		// crackArray.push(new CrackAnimation(CRACK_TYPE_TANK,this.ctx,this));
		// PLAYER_DESTROY_AUDIO.play();
	}
	
	renascenc(player: number){
		this.lives-- ;
		this.dir = UP;
		this.isProtected = true;
		this.protectedTime = 500;
		this.isDestroyed = false;
		let temp = 0 ;
		if(player === 1){
			temp = 129;
		}else{
			temp = 256;
		}
		this.x = temp + BattleCityGlobalContext.map!.offsetX;
		this.y = 385 + BattleCityGlobalContext.map!.offsetY;
	}
}

export class BattleCityEnemyTank extends BattleCityTankWithContext {
	isAppear = false;
	times = 0;
	lives = 1;

    constructor(context: CanvasRenderingContext2D) {
        super(context);
        this.isAI = true;
    }
}

export class BattleCityEnemyOne extends BattleCityEnemyTank {
    constructor(context: CanvasRenderingContext2D) {
        super(context);
        this.speed = 1.5;
    }

    draw(){
		this.times ++;
		if(!this.isAppear){
			// var temp = parseInt(this.times/5)%7;
            let temp = Math.floor(this.times / 5) % 7;
			this.ctx.drawImage(BattleCityGlobalContext.imageResource,
                ImagePOS["enemyBefore"][0] + temp * 32,
                ImagePOS["enemyBefore"][1], 32, 32, this.x, this.y, 32, 32);
			if(this.times == 34){
				this.isAppear = true;
				this.times = 0;
				this.shoot(2);
			}
		}else{
			this.ctx.drawImage(BattleCityGlobalContext.imageResource,
                ImagePOS["enemy1"][0] + this.dir * this.size,
                ImagePOS["enemy1"][1], 32, 32, this.x, this.y, 32, 32);
			
			//以一定的概率射击
			if(this.times %50 ==0){
				let ra = Math.random();
				if(ra < this.shootRate){
					this.shoot(2);
				}
				this.times = 0;
			}
			this.move();
		}
	}
}

export class BattleCityEnemyTwo extends BattleCityEnemyTank {
    constructor(context: CanvasRenderingContext2D) {
        super(context);
        this.speed = 1;    
    }

    draw(){
		this.times ++;
		if(!this.isAppear){
			// var temp = parseInt(this.times/5)%7;
            let temp = Math.floor(this.times / 5) % 7;
			this.ctx.drawImage(BattleCityGlobalContext.imageResource,
                ImagePOS["enemyBefore"][0]+temp*32,ImagePOS["enemyBefore"][1],32,32,this.x,this.y,32,32);
			if(this.times == 35){
				this.isAppear = true;
				this.times = 0;
				this.shoot(2);
			}
		}else{
			this.ctx.drawImage(BattleCityGlobalContext.imageResource,
                ImagePOS["enemy2"][0]+this.dir*this.size,ImagePOS["enemy2"][1],32,32,this.x,this.y,32,32);
			//以一定的概率射击
			if(this.times %50 ==0){
				let ra = Math.random();
				if(ra < this.shootRate){
					this.shoot(2);
				}
				this.times = 0;
			}
			this.move();
		}
	}
}

export class BattleCityEnemyThree extends BattleCityEnemyTank {
    constructor(context: CanvasRenderingContext2D) {
        super(context);
        this.speed = 0.5;    
    }

    draw() {
		this.times ++;
		if(!this.isAppear){
			// var temp = parseInt(this.times/5)%7;
            let temp = Math.floor(this.times / 5) % 7;
			this.ctx.drawImage(BattleCityGlobalContext.imageResource,
                ImagePOS["enemyBefore"][0]+temp*32,
                ImagePOS["enemyBefore"][1],32,32,this.x,this.y,32,32);
			if(this.times == 35){
				this.isAppear = true;
				this.times = 0;
				this.shoot(2);
			}
		}else{
			this.ctx.drawImage(BattleCityGlobalContext.imageResource,
                ImagePOS["enemy3"][0]+this.dir*this.size+(3-this.lives)*this.size*4,
                ImagePOS["enemy3"][1],32,32,this.x,this.y,32,32);
			//以一定的概率射击
			if(this.times %50 ==0){
				let ra = Math.random();
				if(ra < this.shootRate){
					this.shoot(2);
				}
				this.times = 0;
			}
			this.move();
		}		
	}
}

export class BattleCityBullet {
	x = 0;
	y = 0;
	speed = 3;
	size = 6;
	hit = false;
	isDestroyed = false;
	ctx: CanvasRenderingContext2D;
	owner: BattleCityTank; //子弹的所属者
	type = 0; //1、玩家  2、敌方
	dir = 0;

    constructor(context: CanvasRenderingContext2D, owner: BattleCityTank, typ: number, dir: number) {
        this.ctx = context;
        this.type = typ;
        this.dir = dir;
        this.owner = owner;
    }
    draw(){
		this.ctx.drawImage(BattleCityGlobalContext.imageResource,
            ImagePOS["bullet"][0]+this.dir*this.size,
            ImagePOS["bullet"][1],this.size,this.size,this.x,this.y,this.size,this.size);
		this.move();
	}
	
	move(){
		if(this.dir === UP){
			this.y -= this.speed;
		}else if(this.dir === DOWN){
			this.y += this.speed;
		}else if(this.dir === RIGHT){
			this.x += this.speed;
		}else if(this.dir === LEFT){
			this.x -= this.speed;
		}
		
		this.isHit();
	}

	/**
	 * 碰撞检测
	 */
	isHit(){
		if(this.isDestroyed){
			return;
		}
		//临界检测
		if(this.x < BattleCityGlobalContext.map!.offsetX){
			this.x = BattleCityGlobalContext.map!.offsetX;
			this.hit = true;
		}else if(this.x > BattleCityGlobalContext.map!.offsetX + BattleCityGlobalContext.map!.mapWidth - this.size){
			this.x = BattleCityGlobalContext.map!.offsetX + BattleCityGlobalContext.map!.mapWidth - this.size;
			this.hit = true;
		}
		if(this.y < BattleCityGlobalContext.map!.offsetY){
			this.y = BattleCityGlobalContext.map!.offsetY;
			this.hit = true;
		}else if(this.y > BattleCityGlobalContext.map!.offsetY + BattleCityGlobalContext.map!.mapHeight - this.size){
			this.y = BattleCityGlobalContext.map!.offsetY + BattleCityGlobalContext.map!.mapHeight - this.size;
			this.hit = true;
		}
		// 子弹是否碰撞了其他子弹
		if(!this.hit){
			if(BattleCityGlobalContext.bulletArray.length > 0){
				for(let i=0; i  < BattleCityGlobalContext.bulletArray.length; i++){
					if(BattleCityGlobalContext.bulletArray[i] != this && this.owner.isAI != BattleCityGlobalContext.bulletArray[i].owner.isAI 
                        && BattleCityGlobalContext.bulletArray[i].hit == false && BattleCityGlobalContext.CheckIntersect(BattleCityGlobalContext.bulletArray[i],this,0)){
						this.hit = true;
						BattleCityGlobalContext.bulletArray[i].hit = true;
						break;
					}
				}
			}
		}
		
		if(!this.hit){
			//地图检测
			if(BattleCityGlobalContext.bulletMapCollision(this, BattleCityGlobalContext.map!)){
				this.hit = true;
			}
			//是否击中坦克
			if(this.type == BULLET_TYPE_PLAYER){
				if(BattleCityGlobalContext.enemyArray.length > 0){
					for(let i = 0; i < BattleCityGlobalContext.enemyArray.length; i++){
						let enemyObj = BattleCityGlobalContext.enemyArray[i];
						if(!enemyObj.isDestroyed && BattleCityGlobalContext.CheckIntersect(this,enemyObj,0)){
							BattleCityGlobalContext.CheckIntersect(this,enemyObj,0);
							if(enemyObj.lives > 1){
								enemyObj.lives --;
							}else{
								enemyObj.distroy();
							}
							this.hit = true;
							break;
						}
					}
				}
			} else if(this.type == BULLET_TYPE_ENEMY){
				if(BattleCityGlobalContext.player1!.lives > 0 && BattleCityGlobalContext.CheckIntersect(this, BattleCityGlobalContext.player1, 0)){
					if(!BattleCityGlobalContext.player1!.isProtected && !BattleCityGlobalContext.player1!.isDestroyed){
						BattleCityGlobalContext.player1!.distroy();
					}
					this.hit = true;
				}else if(BattleCityGlobalContext.player2!.lives > 0 && BattleCityGlobalContext.CheckIntersect(this, BattleCityGlobalContext.player2, 0)){
					if(!BattleCityGlobalContext.player2!.isProtected && !BattleCityGlobalContext.player2!.isDestroyed){
						BattleCityGlobalContext.player2!.distroy();
					}
					this.hit = true;
				}
			}
		}
		
		
		if(this.hit){
			this.distroy();
		}
	}
	
	/**
	 * 销毁
	 */
	distroy(){
		this.isDestroyed = true;
        // TBD
		// crackArray.push(new CrackAnimation(CRACK_TYPE_BULLET,this.ctx,this));
		// if(!this.owner.isAI){
		// 	BULLET_DESTROY_AUDIO.play();
		// }
	}
	
}

export class BattleCityStage {
	ctx: CanvasRenderingContext2D;
	drawHeigth = 15;
	level = 0;
	temp = 0;
	dir = 1; //中间切换的方向，1：合上，2：展开
	isReady = false;//标识地图是否已经画好
	levelNum: BattleCityNum;

    constructor(context: CanvasRenderingContext2D, lvl: number) {
        this.ctx = context;
        this.ctx.fillStyle = "#7f7f7f";
        this.levelNum = new BattleCityNum(context);
        this.level = lvl;
    }
	
	init(level: number){
		this.dir = 1;
		this.isReady = false;
		this.level = level;
		this.temp = 0;
	};
	
	draw(){
		if(this.dir === 1){			
			// temp = 15*15 灰色屏幕已经画完
			if(this.temp == 225){
				// 78,14为STAGE字样在图片资源中的宽和高，194,208为canvas中的位置
				this.ctx.drawImage(BattleCityGlobalContext.imageResource, ImagePOS["stageLevel"][0], ImagePOS["stageLevel"][1], 78, 14, 194, 208, 78, 14);
				// 14为数字的宽和高，308, 208为canvas中的位置
				this.levelNum.draw(this.level,308, 208);
				//this.ctx.drawImage(RESOURCE_IMAGE,POS["num"][0]+this.level*14,POS["num"][1],14, 14,308, 208,14, 14);
				// 绘制地图,调用main里面的方法
				BattleCityGlobalContext.initMap();
				
			}else if(this.temp === 225 + 600){
				//600即调用了600/15次，主要用来停顿
				this.temp = 225;
				this.dir = -1;
				// START_AUDIO.play(); 
			}else{
				this.ctx.fillRect(0, this.temp, 512, this.drawHeigth);
				this.ctx.fillRect(0, 448 - this.temp - this.drawHeigth , 512, this.drawHeigth);
			}
		}else{
			if(this.temp >= 0){
				this.ctx.clearRect(0, this.temp , 512, this.drawHeigth);
				this.ctx.clearRect(0, 448 - this.temp - this.drawHeigth, 512, this.drawHeigth);
			}else{
				this.isReady = true;
			}
		}
		this.temp += this.drawHeigth * this.dir;
	};
}

export class BattleCityMenu {
    private x = 0;
    private y = BC_Screen_Height;
	selectTank = new BattleCitySelectTank();
	private playNum = 1;
	private times = 0;
    private context: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.context = ctx;
    }

    draw() {
        console.debug('Entering BattleCityMenu.draw');

		this.times ++ ;
		let temp = 0;
		if(parseInt((this.times / 6).toString()) % 2 === 0){
			temp = 0;
		} else {
			temp = this.selectTank.size;
		}
		if(this.y <= 0){
			this.y = 0;
		} else {
			this.y -= 5;
		}
		this.context.clearRect(0, 0, BC_Screen_Width, BC_Screen_Height);   
		this.context.save(); 
		// 画背景
		this.context.drawImage(BattleCityGlobalContext.imageMenu, 0, 0, BC_Screen_Width, BC_Screen_Height,
            0, 0, BC_Screen_Width, BC_Screen_Height);
        // 画选择坦克
		this.context.drawImage(BattleCityGlobalContext.imageResource,
            ImagePOS["selectTank"][0], ImagePOS["selectTank"][1] + temp,
            this.selectTank.size, this.selectTank.size,
			this.selectTank.x, this.y + this.selectTank.ys[this.playNum-1],
            this.selectTank.size, this.selectTank.size);
		this.context.restore();
    }

    next(n: number) {
		this.playNum += n;
		if(this.playNum > 2){
			this.playNum = 1;
		} else if(this.playNum < 1){
			this.playNum = 2;
		}
    }
}