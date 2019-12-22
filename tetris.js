const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");

const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 20;
const VACANT = "WHITE"; // цвет пустого квадратика

// нарисовать квадратик
function drawSquare(x,y,color){
    ctx.fillStyle = color;
    ctx.fillRect(x*SQ,y*SQ,SQ,SQ);

    ctx.strokeStyle = "BLACK";
    ctx.strokeRect(x*SQ,y*SQ,SQ,SQ);
}

// создание игровой площади
let board = [];
for( r = 0; r <ROW; r++){
    board[r] = [];
    for(c = 0; c < COL; c++){
        board[r][c] = VACANT;
    }
}

// рисование игровой площади
function drawBoard(){
    for( r = 0; r <ROW; r++){
        for(c = 0; c < COL; c++){
            drawSquare(c,r,board[r][c]);
        }
    }
}

drawBoard();

// фигуры и их цвета
const PIECES = [
    [Z,"red"],
    [S,"green"],
    [T,"yellow"],
    [O,"blue"],
    [L,"purple"],
    [I,"cyan"],
    [J,"orange"]
];

// генерация случайного блока
function randomPiece(){
    let r = randomN = Math.floor(Math.random() * PIECES.length) // 0 -> 6
    return new Piece( PIECES[r][0],PIECES[r][1]);
}

let p = randomPiece();

//  фигура
function Piece(tetromino,color){
    this.tetromino = tetromino;
    this.color = color;
    
    this.tetrominoN = 0; // мы начинаем с первого паттерна.
    this.activeTetromino = this.tetromino[this.tetrominoN];
    
    // контроль создания фигур
    this.x = 3;
    this.y = -2;
}

// функция заливки
Piece.prototype.fill = function(color){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // мы рисуем только занятые квадраты
            if( this.activeTetromino[r][c]){
                drawSquare(this.x + c,this.y + r, color);
            }
        }
    }
}

// нарисовать фигуру на доске
Piece.prototype.draw = function(){
    this.fill(this.color);
}

//  силуэт фигурки на доске
Piece.prototype.unDraw = function(){
    this.fill(VACANT);
}

// движение вниз
Piece.prototype.moveDown = function(){
    if(!this.collision(0,1,this.activeTetromino)){
        this.unDraw();
        this.y++;
        this.draw();
    }else{
        // мы блокируем кусок и генерируем новый
        this.lock();
        p = randomPiece();
    }
    
}

// движение вправо
Piece.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// движение влево
Piece.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// вращение фигуры в пространстве
Piece.prototype.rotate = function(){
    let nextPattern = this.tetromino[(this.tetrominoN + 1)%this.tetromino.length];
    let kick = 0;
    
    if(this.collision(0,0,nextPattern)){
        if(this.x > COL/2){
            // это правая стена
            kick = -1; // нам нужно переместить кусок влево
        }else{
            // это левая стена
            kick = 1; //нам нужно переместить кусок вправо
        }
    }
    
    if(!this.collision(kick,0,nextPattern)){
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length; // (0+1)%4 => 1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

let score = 0;

Piece.prototype.lock = function(){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // we skip the vacant squares
            if( !this.activeTetromino[r][c]){
                continue;
            }
            // фигура не отображается сверху = игра окончена
            if(this.y + r < 0){
                alert("Game Over");
                // остановить анимационный кадр запроса
                gameOver = true;
                break;
            }
            // мы заблокировали фигуру
            board[this.y+r][this.x+c] = this.color;
        }
    }
    // удалить полные строки
    for(r = 0; r < ROW; r++){
        let isRowFull = true;
        for( c = 0; c < COL; c++){
            isRowFull = isRowFull && (board[r][c] != VACANT);
        }
        if(isRowFull){
            // if the row is full
            // we move down all the rows above it
            for( y = r; y > 1; y--){
                for( c = 0; c < COL; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            // the top row board[0][..] has no row above it
            for( c = 0; c < COL; c++){
                board[0][c] = VACANT;
            }
            // increment the score
            score += 10;
        }
    }
    // обновление игровой площади
    drawBoard();
    
    // обновить счёт
    scoreElement.innerHTML = score;
}

// функция столкновения
Piece.prototype.collision = function(x,y,piece){
    for( r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){
            // если квадрат пустой, мы его пропускаем
            if(!piece[r][c]){
                continue;
            }
            // координаты фигуры после движения
            let newX = this.x + c + x;
            let newY = this.y + r + y;
            
            // условия
            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }
            // пропустить newY <0; доска [-1] сломает нашу игру
            if(newY < 0){
                continue;
            }
            // проверьте, есть ли уже впереди квадратик за доской
            if( board[newY][newX] != VACANT){
                return true;
            }
        }
    }
    return false;
}

// управление
document.addEventListener("keydown",CONTROL);

function CONTROL(event){
    if(event.keyCode == 37){
        p.moveLeft();
        dropStart = Date.now();
    }else if(event.keyCode == 38){
        p.rotate();
        dropStart = Date.now();
    }else if(event.keyCode == 39){
        p.moveRight();
        dropStart = Date.now();
    }else if(event.keyCode == 40){
        p.moveDown();
    }
}

// спуск фигуры каждую 1 сек
let dropStart = Date.now();
let gameOver = false;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > 1000){
        p.moveDown();
        dropStart = Date.now();
    }
    if( !gameOver){
        requestAnimationFrame(drop);
    }
}

drop();



















