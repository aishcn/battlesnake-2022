import { InfoResponse, GameState, MoveResponse, Game, Board, Coord, Battlesnake } from "./types"

export function info(): InfoResponse {
    console.log("INFO")
    const response: InfoResponse = {
        apiversion: "1",
        author: "",
        color: "#800000",
        head: "evil",
        tail: "hook"
    }
    return response
}

export function start(gameState: GameState): void {
    console.log(`${gameState.game.id} START`)
}

export function end(gameState: GameState): void {
    console.log(`${gameState.game.id} END\n`)
}

function floodFillCount(boardWidth: number, boardHeight: number, snakeSquares: Coord[], startX: number, startY: number, snakeLength: number) : number {
    if(0 > startX || startX >= boardWidth || 0 > startY || startY >= boardHeight) return 0;

    let visited : boolean[][] = [];

    for(let i = 0; i < boardHeight; i++){
      visited.push([]);
      for(let j = 0; j < boardWidth; j++){
        visited[i].push(false);
      }
    }

    for(let coord of snakeSquares){
        visited[coord.y][coord.x] = true;
    }

    let q: number[][] = [[startY, startX]];
    let result = 0;

    while(q.length > 0){
        let cur = q.shift();

        if(cur === undefined || visited[cur[0]][cur[1]]){
            continue;
        }

        let curY = cur[0];
        let curX = cur[1];

        result++;
        visited[curY][curX] = true;

        if(result >= snakeLength) return result;

        for(let dx = -1; dx <= 1; dx++){
            for(let dy = -1; dy <= 1; dy++){
                if((dx == 0) != (dy == 0)){
                    if(0 <= curX + dx && curX + dx < boardWidth){
                        if(0 <= curY + dy && curY + dy < boardHeight){
                            if(!visited[curY + dy][curX + dx]){
                                q.push([curY + dy, curX + dx]);
                            }
                        }
                    }
                }
            }
        }
    }

    return result;
}

function isSquareSafeFromOtherSnakes(me: Battlesnake, snakes: Battlesnake[], targetX: number, targetY: number) : boolean {
    for(let snake of snakes){
        if(snake.id == me.id) continue;
        if(snake.body.length < me.body.length) continue;

        if(Math.abs(snake.body[0].x - targetX) + Math.abs(snake.body[0].y - targetY) <= 1){
            return false;
        }
    }

    return true;
}

function minDistToBiggerSnake(me: Battlesnake, snakes: Battlesnake[]) : number {
    let result = 999999;
    for(let snake of snakes){
        if(snake.id == me.id) continue;
        if(snake.body.length < me.body.length) continue;

        result = Math.min(result, Math.abs(me.body[0].x - snake.body[0].x) + Math.abs(me.body[0].y - snake.body[0].y));
    }
    return result;
}

function amITheBiggest(me: Battlesnake, snakes: Battlesnake[]): boolean {
    for(let snake of snakes){
        if(snake.id == me.id) continue;
        if(snake.body.length < me.body.length) continue;

        if(snake.body.length >= me.body.length){
            return false;
        }
    }

    return true;
}

function distanceToClosestFood(boardWidth: number, boardHeight: number, snakeSquares: Coord[], foodSquares: Coord[], startX: number, startY: number): number {
    if(foodSquares.length == 0) return 999999;
    if(0 > startX || startX >= boardWidth || 0 > startY || startY >= boardHeight) return 999999;

    let visited : boolean[][] = [];

    for(let i = 0; i < boardHeight; i++){
      visited.push([]);
      for(let j = 0; j < boardWidth; j++){
        visited[i].push(false);
      }
    }

    for(let coord of snakeSquares){
        visited[coord.y][coord.x] = true;
    }

    visited[startY][startX] = false;

    let q: number[][] = [[startY, startX]];
    let result: number = 0;

    while(q.length > 0) {

        let newQ: number[][] = [];

        while(q.length > 0){
            let cur = q.shift();

            if(cur === undefined || visited[cur[0]][cur[1]]){
                continue;
            }

            let curY = cur[0];
            let curX = cur[1];

            for(let coord of foodSquares){
                if(curY == coord.y && curX == coord.x){
                    return result;
                }
            }

            visited[curY][curX] = true;

            for(let dx = -1; dx <= 1; dx++){
                for(let dy = -1; dy <= 1; dy++){
                    if((dx == 0) != (dy == 0)){
                        if(0 <= curX + dx && curX + dx < boardWidth){
                            if(0 <= curY + dy && curY + dy < boardHeight){
                                if(!visited[curY + dy][curX + dx]){
                                    newQ.push([curY + dy, curX + dx]);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        q = newQ.slice();
        result++;
    }

    return 999999;
}

function canGetToSquare(boardWidth: number, boardHeight: number, snakeSquares: Coord[], startX: number, startY: number, targetX: number, targetY: number): boolean {
    if(0 > startX || startX >= boardWidth || 0 > startY || startY >= boardHeight) return false;

    // console.log(`entering canGetToSquareCheck`)
    // console.log(`starting coords x: ${startX}, y: ${startY}`)
    // console.log(`target coords x: ${targetX}, y: ${targetY}`)

    let visited : boolean[][] = [];

    for(let i = 0; i < boardHeight; i++){
      visited.push([]);
      for(let j = 0; j < boardWidth; j++){
        visited[i].push(false);
      }
    }

    for(let coord of snakeSquares){
        visited[coord.y][coord.x] = true;
    }

    visited[targetY][targetX] = false;

    let q: number[][] = [[startY, startX]];

    while(q.length > 0){
        let cur = q.shift();

        if(cur === undefined || visited[cur[0]][cur[1]]){
            continue;
        }

        let curY = cur[0];
        let curX = cur[1];

        if(curY == targetY && curX == targetX){
            // console.log(`can get to square? yes`)
            return true;
        }

        visited[curY][curX] = true;

        for(let dx = -1; dx <= 1; dx++){
            for(let dy = -1; dy <= 1; dy++){
                if((dx == 0) != (dy == 0)){
                    if(0 <= curX + dx && curX + dx < boardWidth){
                        if(0 <= curY + dy && curY + dy < boardHeight){
                            if(!visited[curY + dy][curX + dx]){
                                q.push([curY + dy, curX + dx]);
                            }
                        }
                    }
                }
            }
        }
    }
    
    // console.log(`can get to square? no`)
    return false;
}

export function move(gameState: GameState): MoveResponse {
    let possibleMoves: { [key: string]: boolean } = {
        up: true,
        down: true,
        left: true,
        right: true
    };

    // Step 0: Don't let your Battlesnake move back on it's own neck
    const myHead = gameState.you.head;
    const myNeck = gameState.you.body[1];
    const myTail = gameState.you.body[gameState.you.body.length - 1];
    if (myNeck.x < myHead.x) {
        possibleMoves.left = false;
    } else if (myNeck.x > myHead.x) {
        possibleMoves.right = false;
    } else if (myNeck.y < myHead.y) {
        possibleMoves.down = false;
    } else if (myNeck.y > myHead.y) {
        possibleMoves.up = false;
    }

    // Step 1 - Don't hit walls.
    // Use information in gameState to prevent your Battlesnake from moving beyond the boundaries of the board.
    const boardWidth = gameState.board.width;
    const boardHeight = gameState.board.height;

    if(myHead.x == 0){
        possibleMoves.left = false;
    }
    if(myHead.x == boardWidth - 1){
        possibleMoves.right = false;
    }
    if(myHead.y == 0){
        possibleMoves.down = false;
    }
    if(myHead.y == boardHeight - 1){
        possibleMoves.up = false;
    }

    // Step 2 & Step 3 - Combined
    // prevent hitting into snakes; myself or others

    let snakeSquares: Coord[] = [];
    
    for(let snake of gameState.board.snakes){
        for(let coord of snake.body){
            snakeSquares.push(coord);
        }
    }

    for(let coord of snakeSquares){
        if(coord.x == myHead.x){
            if(coord.y == myHead.y - 1){
                possibleMoves.down = false;
            }
            if(coord.y == myHead.y + 1){
                possibleMoves.up = false;
            }
        }
        if(coord.y == myHead.y){
            if(coord.x == myHead.x + 1){
                possibleMoves.right = false;
            }
            if(coord.x == myHead.x - 1){
                possibleMoves.left = false;
            }
        }
    }

    if((!possibleMoves.up || !isSquareSafeFromOtherSnakes(gameState.you, gameState.board.snakes, gameState.you.head.x, gameState.you.head.y + 1))
        && (!possibleMoves.down || !isSquareSafeFromOtherSnakes(gameState.you, gameState.board.snakes, gameState.you.head.x, gameState.you.head.y - 1))
        && (!possibleMoves.right || !isSquareSafeFromOtherSnakes(gameState.you, gameState.board.snakes, gameState.you.head.x + 1, gameState.you.head.y))
        && (!possibleMoves.left || !isSquareSafeFromOtherSnakes(gameState.you, gameState.board.snakes, gameState.you.head.x - 1, gameState.you.head.y))){
        for(let move in possibleMoves){
            if(possibleMoves[move]){
                const response: MoveResponse = {
                    move: move,
                    shout: "uh oh"
                }
        
                console.log(`yikes: ${move}`);
                console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`);
                return response;
            }
        }

        const response: MoveResponse = {
            move: "up",
            shout: "what do I do now"
        }

        console.log(`big yikes: up`);
        console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`);
        return response;
    }

    if(!isSquareSafeFromOtherSnakes(gameState.you, gameState.board.snakes, gameState.you.head.x, gameState.you.head.y + 1)){
        possibleMoves.up = false;
    }
    if(!isSquareSafeFromOtherSnakes(gameState.you, gameState.board.snakes, gameState.you.head.x, gameState.you.head.y - 1)){
        possibleMoves.down = false;
    }
    if(!isSquareSafeFromOtherSnakes(gameState.you, gameState.board.snakes, gameState.you.head.x + 1, gameState.you.head.y)){
        possibleMoves.right = false;
    }
    if(!isSquareSafeFromOtherSnakes(gameState.you, gameState.board.snakes, gameState.you.head.x - 1, gameState.you.head.y)){
        possibleMoves.left = false;
    }

    let floodFillCounts: { [key: string]: number } = {
        up: possibleMoves.up ? floodFillCount(boardWidth, boardHeight, snakeSquares, gameState.you.head.x, gameState.you.head.y + 1, gameState.you.body.length) : 0,
        down: possibleMoves.down ? floodFillCount(boardWidth, boardHeight, snakeSquares, gameState.you.head.x, gameState.you.head.y - 1, gameState.you.body.length) : 0,
        left: possibleMoves.left ? floodFillCount(boardWidth, boardHeight, snakeSquares, gameState.you.head.x - 1, gameState.you.head.y, gameState.you.body.length) : 0,
        right: possibleMoves.right ? floodFillCount(boardWidth, boardHeight, snakeSquares, gameState.you.head.x + 1, gameState.you.head.y, gameState.you.body.length) : 0
    }

    let canGetToTail: { [key: string]: boolean } = {
        up: floodFillCounts.up > 0 ? canGetToSquare(boardWidth, boardHeight, snakeSquares, gameState.you.head.x, gameState.you.head.y + 1, myTail.x, myTail.y) : false,
        down: floodFillCounts.down > 0 ? canGetToSquare(boardWidth, boardHeight, snakeSquares, gameState.you.head.x, gameState.you.head.y - 1, myTail.x, myTail.y) : false,
        left: floodFillCounts.left > 0 ? canGetToSquare(boardWidth, boardHeight, snakeSquares, gameState.you.head.x - 1, gameState.you.head.y, myTail.x, myTail.y) : false,
        right: floodFillCounts.right > 0 ? canGetToSquare(boardWidth, boardHeight, snakeSquares, gameState.you.head.x + 1, gameState.you.head.y, myTail.x, myTail.y) : false
    }

    let floodFillCountBad: { [key: string]: boolean } = {
        up: floodFillCounts.up < gameState.you.body.length && !canGetToTail.up,
        down: floodFillCounts.down < gameState.you.body.length && !canGetToTail.down,
        left: floodFillCounts.left < gameState.you.body.length && !canGetToTail.left,
        right: floodFillCounts.right < gameState.you.body.length && !canGetToTail.right
    }

    const floodFillCountsAllBad = floodFillCountBad.up && floodFillCountBad.down && floodFillCountBad.left && floodFillCountBad.right;
    
    let maxFloodFill = -1;
    let maxFloodFillMove = "";
    for(let move in floodFillCounts){
        if(floodFillCounts[move] == maxFloodFill && canGetToTail[move]){
            maxFloodFill = floodFillCounts[move];
            maxFloodFillMove = move;
        }
        if(floodFillCounts[move] > maxFloodFill){
            maxFloodFill = floodFillCounts[move];
            maxFloodFillMove = move;
        }
    }

    // if we're in trouble, try to survive for as long as possible
    if(floodFillCountsAllBad){
        const response: MoveResponse = {
            move: maxFloodFillMove,
            shout: "uh oh"
        }

        console.log(`panik: ${maxFloodFillMove}`);
        console.log(floodFillCounts);
        console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`);
        return response;
    }

    for(let move in floodFillCountBad){
        if(floodFillCountBad[move]){
            possibleMoves[move] = false;
        }
    }

    let foodDists: { [key: string]: number } = {
        up: possibleMoves.up ? distanceToClosestFood(boardWidth, boardHeight, snakeSquares, gameState.board.food, gameState.you.head.x, gameState.you.head.y + 1) : Infinity,
        down: possibleMoves.down ? distanceToClosestFood(boardWidth, boardHeight, snakeSquares, gameState.board.food, gameState.you.head.x, gameState.you.head.y - 1) : Infinity,
        right: possibleMoves.right ? distanceToClosestFood(boardWidth, boardHeight, snakeSquares, gameState.board.food, gameState.you.head.x + 1, gameState.you.head.y) : Infinity,
        left: possibleMoves.left ? distanceToClosestFood(boardWidth, boardHeight, snakeSquares, gameState.board.food, gameState.you.head.x - 1, gameState.you.head.y) : Infinity
    }

    let minDist = Infinity;
    let minDistMove = "";
    for(let move in foodDists) {
        if(foodDists[move] < minDist){
            minDist = foodDists[move];
            minDistMove = move;
        }
    }

    const safeMoves = Object.keys(possibleMoves).filter(key => possibleMoves[key]);

    // const response: MoveResponse = {
    //     move: gameState.you.health < 80 ? minDistMove : minDistToBiggerSnake(gameState.you, gameState.board.snakes) < 5 ? maxFloodFillMove : safeMoves[Math.floor(Math.random() * safeMoves.length)],
    //     shout: "uh oh"
    // }

    // const response: MoveResponse = {
    //     move: gameState.you.health < 80 ? minDistMove : maxFloodFillMove,
    //     shout: "uh oh"
    // }

    // const response: MoveResponse = {
    //     move: minDistMove,
    //     shout: "uh oh"
    // }

    const response: MoveResponse = {
        move: !amITheBiggest(gameState.you, gameState.board.snakes) ? minDistMove : gameState.you.health < 50 ? minDistMove : maxFloodFillMove,
        shout: "uh oh"
    }

    console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`);
    return response;
}
