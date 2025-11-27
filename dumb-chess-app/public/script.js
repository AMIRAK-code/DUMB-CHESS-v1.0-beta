document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.querySelector('.chessboard');
    const rows = 8;
    const cols = 8;
    let boardState = []; 
    let selectedSquare = null; 
    let isPlayerTurn = true; 
    let gameActive = true;

    // Icons
    const PIECES = {
        wP: '♙', wK: '♔', 
        bP: '♟', bK: '♚', 
        empty: ''
    };

    // --- INIT GAME ---
    function initGame() {
        gameActive = true;
        isPlayerTurn = true;
        selectedSquare = null;
        
        // Create 8x8 Empty Board
        boardState = Array(8).fill(null).map(() => Array(8).fill(null));

        // Place Pieces (Rows 0-1 for Black, 6-7 for White)
        for(let c=0; c<8; c++) boardState[1][c] = 'bP'; // Black Pawns
        boardState[0][4] = 'bK'; // Black King

        for(let c=0; c<8; c++) boardState[6][c] = 'wP'; // White Pawns
        boardState[7][4] = 'wK'; // White King

        // Remove spin effect (Reset board to upright)
        boardElement.classList.remove('flipped');

        drawBoard();
        removeOverlay(); 
    }

    // --- DRAW BOARD ---
    function drawBoard() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const squareId = `square-${r}-${c}`;
                const squareEl = document.getElementById(squareId);
                const pieceCode = boardState[r][c];

                // Update UI text
                squareEl.innerText = pieceCode ? PIECES[pieceCode] : '';
                
                // Clear highlights
                squareEl.classList.remove('selected', 'valid-move');
                
                // Reset Click Listeners
                const newSquareEl = squareEl.cloneNode(true);
                squareEl.parentNode.replaceChild(newSquareEl, squareEl);
                
                newSquareEl.addEventListener('click', () => handleSquareClick(r, c));
            }
        }
    }

    // --- PLAYER CLICK LOGIC ---
    function handleSquareClick(row, col) {
        if (!gameActive || !isPlayerTurn) return;

        const clickedPiece = boardState[row][col];
        const isWhitePiece = clickedPiece && clickedPiece.startsWith('w');

        // PRIORITY 1: If we have a selection, try to MOVE (Attack Friend or Foe)
        if (selectedSquare) {
             if (isValidMove(selectedSquare.r, selectedSquare.c, row, col)) {
                movePiece(selectedSquare.r, selectedSquare.c, row, col);
                
                if (gameActive) {
                    isPlayerTurn = false;
                    setTimeout(aiTurn, 500); // AI moves after 0.5s
                }
                return; // Stop here, we moved.
            }
        }

        // PRIORITY 2: If we didn't move, assume we are Selecting a piece
        if (isWhitePiece) {
            selectedSquare = { r: row, c: col };
            highlightValidMoves(row, col);
        } 
    }

    // --- VALID MOVES (1 Block) ---
    function isValidMove(fromR, fromC, toR, toC) {
        const dRow = Math.abs(toR - fromR);
        const dCol = Math.abs(toC - fromC);
        
        // Logic: Move exactly 1 square in any direction
        // Friendly Fire: We do NOT check if the target is our own piece. We allow it.
        if (dRow <= 1 && dCol <= 1 && (dRow + dCol > 0)) {
            return true;
        }
        return false;
    }

    function highlightValidMoves(r, c) {
        drawBoard(); 
        document.getElementById(`square-${r}-${c}`).classList.add('selected');
        
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const nr = r + i, nc = c + j;
                if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !(i===0 && j===0)) {
                    // Highlight neighbor squares (even if they have our own pieces!)
                    document.getElementById(`square-${nr}-${nc}`).classList.add('valid-move');
                }
            }
        }
    }

    // --- MOVE EXECUTION ---
    function movePiece(fromR, fromC, toR, toC) {
        const piece = boardState[fromR][fromC];
        const target = boardState[toR][toC];

        // Win/Loss Condition
        if (target === 'wK') endGame('Black Wins! You killed your own King (Oops).');
        if (target === 'bK') endGame('White Wins! You killed the Enemy King!');

        // Update Board State
        boardState[toR][toC] = piece;
        boardState[fromR][fromC] = null;
        
        drawBoard();
    }

    // --- AI LOGIC (Dumb but Aggressive) ---
    function aiTurn() {
        if (!gameActive) return;

        const blackPieces = [];
        let whiteKingPos = null;

        // Find all pieces
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (boardState[r][c] && boardState[r][c].startsWith('b')) {
                    blackPieces.push({ r, c, type: boardState[r][c] });
                }
                if (boardState[r][c] === 'wK') whiteKingPos = { r, c };
            }
        }

        if (!whiteKingPos) { endGame('Black Wins! King not found.'); return; }

        let bestMove = null;
        let highestScore = -9999;

        // Score every possible move
        blackPieces.forEach(piece => {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const tr = piece.r + i;
                    const tc = piece.c + j;

                    // Bounds Check
                    if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8 && !(i===0 && j===0)) {
                        const targetContent = boardState[tr][tc];
                        let score = 0;

                        // AI Priorities
                        if (targetContent === 'wK') score = 1000; // Kill King
                        else if (targetContent === 'wP') score = 50; // Kill Pawn
                        else if (targetContent && targetContent.startsWith('b')) score = -20; // Try not to kill self, but allowed
                        else {
                            // Move Closer to King logic
                            const currentDist = Math.abs(piece.r - whiteKingPos.r) + Math.abs(piece.c - whiteKingPos.c);
                            const newDist = Math.abs(tr - whiteKingPos.r) + Math.abs(tc - whiteKingPos.c);
                            if (newDist < currentDist) score += 10;
                        }
                        
                        // Add Chaos (Randomness)
                        score += Math.random() * 5;

                        if (score > highestScore) {
                            highestScore = score;
                            bestMove = { fromR: piece.r, fromC: piece.c, toR: tr, toC: tc };
                        }
                    }
                }
            }
        });

        // Execute AI Move
        if (bestMove) {
            const targetContent = boardState[bestMove.toR][bestMove.toC];
            boardState[bestMove.toR][bestMove.toC] = boardState[bestMove.fromR][bestMove.fromC];
            boardState[bestMove.fromR][bestMove.fromC] = null;

            drawBoard();

            if (targetContent === 'wK') {
                endGame('Black Wins! The AI ate your King.');
            } else {
                isPlayerTurn = true;
            }
        }
    }

    // --- GAME OVER ---
    function endGame(message) {
        gameActive = false;
        
        // TRIGGER THE SPIN!
        boardElement.classList.add('flipped');
        
        // Show Overlay
        const overlay = document.createElement('div');
        overlay.id = 'game-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0,0,0,0.85); display: flex; flex-direction: column;
            justify-content: center; align-items: center; z-index: 1000;
            color: white; font-family: 'Courier New';
        `;
        
        const msgEl = document.createElement('h1');
        msgEl.innerText = message;
        
        const retryBtn = document.createElement('button');
        retryBtn.innerText = 'RETRY GAME';
        retryBtn.style.cssText = `
            padding: 15px 30px; fontSize: 20px; margin-top: 20px;
            cursor: pointer; background-color: #769656; border: none; color: white;
        `;
        
        retryBtn.onclick = initGame; 

        overlay.appendChild(msgEl);
        overlay.appendChild(retryBtn);
        document.body.appendChild(overlay);
    }

    function removeOverlay() {
        const existing = document.getElementById('game-overlay');
        if (existing) existing.remove();
    }

    // Start
    initGame();
});