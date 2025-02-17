export const getValidMoves = (board, row, col) => {
	let moves = [];

	const code = board[row][col];
	switch (code) {
		case 'bp':
			if (row === 1) moves.append([row+2, col]);
			moves.append([row+1, col]);
		case 'wp':
			if (row === 6) moves.append([row-2, col]);
			moves
	}
};