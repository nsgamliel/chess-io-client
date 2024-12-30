import { pieces, pieceEncodings } from './pieces.js';
import { socket, gameColor } from './socketry.js';

//
// BOARD SETUP
//

const chessCanvas = document.getElementById('chess');
const prompts = document.getElementById('open');
const bottomContent = document.getElementById('bottom-content');
const roomElem = document.getElementById("room");
const ctx = chessCanvas.getContext('2d');
const boardColors = ['#eee', '#555'];

const minDim = Math.min(window.innerHeight, window.innerWidth);
const scale = minDim < 400 ? 0.95 : 0.85;
const SIDE = Math.floor((minDim * scale) / 8) * 8;

chessCanvas.width = SIDE;
chessCanvas.height = SIDE;
const SQUARE = SIDE / 8;

bottomContent.style.width = `${SIDE}px`;

export var isInGame = false;

console.log(SQUARE);



const canvasSetup = () => {
	chessCanvas.style.display = 'inline';
	prompts.style.display = 'none';
	bottomContent.style.display = 'block';
};

//
// TRACKING/DISPLAYING
//

const initialDrawBoard = () => {
	for (let row=0; row<8; row++) {
		for (let col=0; col<8; col++) {
			// console.log(row, col, (row + col) % 2, SQUARE * col, SQUARE * row);
			ctx.fillStyle = boardColors[(row + col) % 2];
			ctx.fillRect(SQUARE * col, SQUARE * row, SQUARE, SQUARE);
		}
	}
};

const initialDrawPieces = (board) => {
	for (let row=0; row<8; row++) {
		for (let col=0; col<8; col++) {
			if (board[row][col] !== '') {
				let viewRow = row, viewCol = col;
				if (gameColor === 'black') { viewRow = 7 - row; viewCol = 7 - col; }
				const img = new Image(SQUARE/2, SQUARE/2);
				img.src = pieceEncodings[board[row][col]].src;
				// img.width = SQUARE;
				// img.height = SQUARE;
				img.onload = function() {
					// ctx.imageSmoothingEnabled = false;
					ctx.drawImage(img, viewCol*SQUARE, viewRow*SQUARE, SQUARE, SQUARE);
				};
				img.onerror = function() {
					console.error('Failed to load the SVG image.');
					// err.innerHTML = 'failed to load svg';
				};
			}
		}
	}
};

let board = [
	['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
	['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
	['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']
];

export const initGame = () => {
	canvasSetup();
	initialDrawBoard();
	initialDrawPieces(board);
}

// NOTE: this should always be expressed assuming board is from white pieces' perspective
const drawSquare = (encoding, row, col) => {
	ctx.fillStyle = boardColors[(row + col) % 2];
	ctx.fillRect(SQUARE * col, SQUARE * row, SQUARE, SQUARE);
	if (encoding !== '') {
		const img = new Image();
		img.src = pieceEncodings[encoding].src;
		img.onload = function() {
			ctx.drawImage(img, col*SQUARE, row*SQUARE, SQUARE, SQUARE);
		};
		img.onerror = function() {
			console.error('Failed to load the SVG image.');
			err.innerHTML = 'failed to load svg';
		};
	}
}

export const movePiece = (board, viewRowFrom, viewColFrom, viewRowTo, viewColTo) => {
	
	// console.log(rowFrom, colFrom, rowTo, colTo);

	let rowFrom = viewRowFrom, colFrom = viewColFrom, rowTo = viewRowTo, colTo = viewColTo;
	if (gameColor === 'black') {
		rowFrom = 7 - viewRowFrom;
		colFrom = 7 - viewColFrom;
		rowTo = 7 - viewRowTo;
		colTo = 7 - viewColTo;
	}

	// console.log(rowFrom, colFrom, rowTo, colTo);
	// console.log(board[rowFrom][colFrom], board[rowTo][colTo]);

	if (board[rowFrom][colFrom] !== '') {
		board[rowTo][colTo] = board[rowFrom][colFrom];
		if (rowFrom !== rowTo || colFrom !== colTo) { board[rowFrom][colFrom] = ''; }
		socket.emit("movePiece", roomElem.innerHTML.split(' ')[1], board, [7-viewRowFrom,7-viewColFrom,7-viewRowTo,7-viewColTo]);
	}

	drawSquare(board[rowFrom][colFrom], viewRowFrom, viewColFrom);
	drawSquare(board[rowTo][colTo], viewRowTo, viewColTo);
};



// initialDrawBoard();
// initialDrawPieces(board);


//
// EVENT LISTENERS
//

let isDown = false;
let rowFrom;
let colFrom;
let interRow;
let interCol;

const status = document.getElementById('status');
const coords = document.getElementById('coordinates');
const err = document.getElementById('error');

const downEvent = (e) => {
	isDown = true;
	// console.log(e.offsetX, e.offsetY);
	// console.log(e.type);

	let touch;
	if (e.type === 'touchstart') {
		touch = e.touches[0];
	} else if (e.type === 'mousedown') {
		touch = e;
	}

	const rect = e.target.getBoundingClientRect();
	const col = Math.floor((touch.clientX - rect.left) / SQUARE);
	const row = Math.floor((touch.clientY - rect.top) / SQUARE);

	rowFrom = row;
	colFrom = col;
	interRow = row;
	interCol = col;

	// console.log((touch.clientX - rect.left), (touch.clientY - rect.top));

	// status.innerHTML = e.type;
	// coords.innerHTML = `${row}, ${col}`;

	// console.log(row, col);
};

const moveEvent = (e) => {
	if (isDown) {
		let touch;
		if (e.type === 'touchmove') {
			touch = e.touches[0];
		} else if (e.type === 'mousemove') {
			touch = e;
		}

		const rect = e.target.getBoundingClientRect();
		const col = Math.floor((touch.clientX - rect.left) / SQUARE);
		const row = Math.floor((touch.clientY - rect.top) / SQUARE);

		if (row !== interRow || col !== interCol) {
			let iRow = interRow, iCol = interCol;
			if (gameColor === 'black') {
				iRow = 7 - interRow;
				iCol = 7 - interCol;
			}
		
			// console.log(interRow, interCol);
			ctx.fillStyle = boardColors[(interRow + interCol) % 2];
			ctx.fillRect(SQUARE * interCol, SQUARE * interRow, SQUARE, SQUARE);
			drawSquare(board[iRow][iCol], interRow, interCol);

			interRow = row;
			interCol = col;
		}

		ctx.beginPath();
		ctx.lineWidth = "4";
		ctx.strokeStyle = "#AAA";
		ctx.rect(SQUARE * col + 2, SQUARE * row + 2, SQUARE - 4, SQUARE - 4);
		ctx.stroke();

		// status.innerHTML = e.type;
		// coords.innerHTML = `${row}, ${col}`;
	}
};

const upEvent = (e) => {
	let touch;
	
	// status.innerHTML = e.type;
	
	if (e.type === 'touchend') {
		// console.log('in touch end');
		touch = e.changedTouches[0];
		// console.log(e);
	} else if (e.type === 'mouseup') {
		touch = e;
	}

	// err.innerHTML = touch;

	const rect = e.target.getBoundingClientRect();
	const col = Math.floor((touch.clientX - rect.left) / SQUARE);
	const row = Math.floor((touch.clientY - rect.top) / SQUARE);

	// coords.innerHTML = `${row}, ${col}`;
	isDown = false;

	// console.log(rowFrom, colFrom, row, col);
	movePiece(board, rowFrom, colFrom, row, col);
};

chessCanvas.addEventListener("mousedown", downEvent);
chessCanvas.addEventListener("touchstart", downEvent, { passive: true });

chessCanvas.addEventListener("mousemove", moveEvent);
chessCanvas.addEventListener("touchmove", moveEvent, { passive: true });

chessCanvas.addEventListener("mouseup", upEvent);
chessCanvas.addEventListener("touchend", upEvent);
chessCanvas.addEventListener("touchcancel", upEvent);