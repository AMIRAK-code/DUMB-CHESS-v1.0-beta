let currentDifficulty = 'easy';
let gameActive = false;

// Piece Icons
const PIECES = {
    wP: '♙', wK: '♔', 
    bP: '♟', bK: '♚', bQ: '♛', // Added Black Queen
    empty: ''
};

// --- GLOBAL VARIABLES ---
let boardState = []; 
let selectedSquare = null; 
let isPlayerTurn = true; 

document.addEventListener('DOMContentLoaded', () => {
    // Wait for user to select difficulty
});

// --- 1. GAME SETUP ---
window.selectDifficulty = function(level) {
    currentDifficulty = level;
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-ui').style.filter = 'none'; // Unblur
    
    // Update Rules Text for Stupid Hard
    if (level === 'stupid') {
        const list = document.getElementById('rules-list');
        const queenRule = document.createElement('li');
        queenRule.style.color = 'red';
        queenRule.style.fontWeight = 'bold';
        queenRule.innerText = "👹 BOSS: The Black Queen moves like a REAL Chess Queen (Slide any distance). Good luck.";
        list.appendChild(queenRule);
    }

    initGame();
};

function initGame() {
    gameActive = true;
    isPlayerTurn = true;
    selectedSquare = null;
    
    // Create 8x8 Empty Board
    boardState = Array(8).fill(null).map(() => Array(8).fill(null));

    // --- SETUP BASED ON DIFFICULTY ---
    
    // 1. Black King (Always there)
    boardState[0][4] = 'bK';

    // 2. Black Pawns
    // Easy: 1 Row
    for(let c=0; c<8; c++) boardState[1][c] = 'bP'; 
    
    // Hard: 2 Rows
    if (currentDifficulty === 'hard') {
        for(let c=0; c<8; c++) boardState[2][c] = 'bP'; 
    }

    // Stupid Hard: 1 Row + Queen
    if (currentDifficulty === 'stupid') {
        boardState[0][3] = 'bQ'; // Place Queen next to King
    }

    // 3. White Pieces (Standard)
    for(let c=0; c<8; c++) boardState[6][c] = 'wP'; 
    boardState[7][4] = 'wK'; 

    const boardEl = document.querySelector('.chessboard');
    boardEl.classList.remove('flipped'); // Reset spin
    drawBoard();
}

// --- 2. DRAW BOARD ---
function drawBoard() {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const squareId = `square-${r}-${c}`;
            const squareEl = document.getElementById(squareId);
            const pieceCode = boardState[r][c];

            squareEl.innerText = pieceCode ? PIECES[pieceCode] : '';
            squareEl.classList.remove('selected', 'valid-move');
            
            // Clean Event Listeners
            const newSquareEl = squareEl.cloneNode(true);
            squareEl.parentNode.replaceChild(newSquareEl, squareEl);
            newSquareEl.addEventListener('click', () => handleSquareClick(r, c));
        }
    }
}

// --- 3. CLICK LOGIC (Fixed Bug) ---
function handleSquareClick(row, col) {
    if (!gameActive || !isPlayerTurn) return;

    const clickedPiece = boardState[row][col];
    const isWhitePiece = clickedPiece && clickedPiece.startsWith('w');

    // SCENARIO A: We already have a piece selected
    if (selectedSquare) {
        // 1. Is this a valid move? (This handles Empty squares AND Friendly Fire attacks)
        if (isValidMove(selectedSquare.r, selectedSquare.c, row, col, boardState[selectedSquare.r][selectedSquare.c])) {
            movePiece(selectedSquare.r, selectedSquare.c, row, col);
            
            if (gameActive) {
                isPlayerTurn = false;
                setTimeout(aiTurn, 600);
            }
            return; // Move complete
        }
        
        // 2. If it's NOT a valid move, but I clicked another White piece, switch selection
        if (isWhitePiece) {
            selectedSquare = { r: row, c: col };
            highlightValidMoves(row, col);
            return;
        }

        // 3. Clicked somewhere invalid (empty far away, etc) -> Deselect
        selectedSquare = null;
        drawBoard(); // Clear highlights
    } 
    // SCENARIO B: No piece selected yet
    else {
        if (isWhitePiece) {
            selectedSquare = { r: row, c: col };
            highlightValidMoves(row, col);
        }
    }
}

// --- 4. MOVEMENT RULES ---
function isValidMove(fromR, fromC, toR, toC, pieceType) {
    const dRow = Math.abs(toR - fromR);
    const dCol = Math.abs(toC - fromC);

    // 1. QUEEN LOGIC (Stupid Hard Mode)
    if (pieceType === 'bQ') {
        // Must be straight line or diagonal
        if (dRow === 0 || dCol === 0 || dRow === dCol) {
            return isPathClear(fromR, fromC, toR, toC);
        }
        return false;
    }

    // 2. DUMB LOGIC (Everyone Else - 1 Step)
    if (dRow <= 1 && dCol <= 1 && (dRow + dCol > 0)) {
        return true;
    }
    return false;
}

// Helper for Queen sliding
function isPathClear(r1, c1, r2, c2) {
    const dr = Math.sign(r2 - r1);
    const dc = Math.sign(c2 - c1);
    let r = r1 + dr;
    let c = c1 + dc;

    // Check all squares BETWEEN start and end
    while (r !== r2 || c !== c2) {
        if (boardState[r][c] !== null) return false; // Blocked
        r += dr;
        c += dc;
    }
    return true; // Path is clear
}

function highlightValidMoves(r, c) {
    drawBoard(); 
    document.getElementById(`square-${r}-${c}`).classList.add('selected');
    const pieceType = boardState[r][c];

    // Check all squares on board
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            // Optimization: Only check neighbors for normal pieces, all board for Queen
            if (isValidMove(r, c, i, j, pieceType)) {
                document.getElementById(`square-${i}-${j}`).classList.add('valid-move');
            }
        }
    }
}

// --- 5. EXECUTE MOVE ---
function movePiece(fromR, fromC, toR, toC) {
    const piece = boardState[fromR][fromC];
    const target = boardState[toR][toC];

    // Win Conditions
    if (target === 'wK') endGame('Black Wins! You killed your own King.', false);
    if (target === 'bK') endGame('White Wins! The King is dead.', true);

    boardState[toR][toC] = piece;
    boardState[fromR][fromC] = null;
    drawBoard();
}

// --- 6. AI LOGIC (Enhanced) ---
function aiTurn() {
    if (!gameActive) return;

    const blackPieces = [];
    let whiteKingPos = null;

    // Scan Board
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = boardState[r][c];
            if (p && p.startsWith('b')) blackPieces.push({ r, c, type: p });
            if (p === 'wK') whiteKingPos = { r, c };
        }
    }

    if (!whiteKingPos) { endGame('Black Wins!', false); return; }

    let bestMove = null;
    let highestScore = -99999;

    blackPieces.forEach(piece => {
        // For Queen, scan whole board. For others, scan neighbors.
        const rMin = piece.type === 'bQ' ? 0 : Math.max(0, piece.r - 1);
        const rMax = piece.type === 'bQ' ? 7 : Math.min(7, piece.r + 1);
        const cMin = piece.type === 'bQ' ? 0 : Math.max(0, piece.c - 1);
        const cMax = piece.type === 'bQ' ? 7 : Math.min(7, piece.c + 1);

        for (let i = rMin; i <= rMax; i++) {
            for (let j = cMin; j <= cMax; j++) {
                
                if (isValidMove(piece.r, piece.c, i, j, piece.type)) {
                    const targetContent = boardState[i][j];
                    let score = 0;

                    // AI Priorities
                    if (targetContent === 'wK') score = 5000; // WIN
                    else if (targetContent === 'wP') score = 50;
                    else if (targetContent && targetContent.startsWith('b')) score = -500; // Avoid Friendly Fire
                    else {
                        // Distance heuristic
                        const currentDist = Math.abs(piece.r - whiteKingPos.r) + Math.abs(piece.c - whiteKingPos.c);
                        const newDist = Math.abs(i - whiteKingPos.r) + Math.abs(j - whiteKingPos.c);
                        if (newDist < currentDist) score += 10;
                    }

                    // Queen Logic: Don't risk the Queen unless necessary
                    if (piece.type === 'bQ') {
                         score += 5; // Prefer moving Queen slightly to intimidate
                         // If moving to a spot where a white Pawn is diagonal (1 step), danger! (Simplified check)
                    }

                    score += Math.random() * 10; // Randomness

                    if (score > highestScore) {
                        highestScore = score;
                        bestMove = { fromR: piece.r, fromC: piece.c, toR: i, toC: j };
                    }
                }
            }
        }
    });

    if (bestMove) {
        const target = boardState[bestMove.toR][bestMove.toC];
        movePiece(bestMove.fromR, bestMove.fromC, bestMove.toR, bestMove.toC);
        
        if (target !== 'wK') {
            isPlayerTurn = true;
        }
    }
}

// --- 7. GAME OVER ---
function endGame(message, playerWon) {
    gameActive = false;
    
    document.querySelector('.chessboard').classList.add('flipped');
    
    const overlay = document.createElement('div');
    overlay.id = 'game-overlay';
    
    const msgEl = document.createElement('h1');
    msgEl.innerText = message;
    msgEl.style.textAlign = 'center';
    
    const subMsg = document.createElement('p');
    subMsg.innerText = playerWon ? "Well played!" : "Try again?";
    
    const retryBtn = document.createElement('button');
    retryBtn.className = 'btn btn-easy';
    retryBtn.innerText = 'MAIN MENU';
    
    retryBtn.onclick = function() {
        location.reload(); // Refresh page to go back to start screen
    };

    overlay.appendChild(msgEl);
    overlay.appendChild(subMsg);
    overlay.appendChild(retryBtn);
    document.body.appendChild(overlay);
}