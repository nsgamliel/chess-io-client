// Chess piece svg files taken from https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces

const pieces = {
	black: {
		king: {
			src: './src/pieces/Chess_kdt45.svg',
		},
		queen: {
			src: './src/pieces/Chess_qdt45.svg',
		},
		bishop: {
			src: './src/pieces/Chess_bdt45.svg',
		},
		knight: {
			src: './src/pieces/Chess_ndt45.svg',
		},
		rook: {
			src: './src/pieces/Chess_rdt45.svg',
		},
		pawn: {
			src: './src/pieces/Chess_pdt45.svg',
		}
	},
	white: {
		king: {
			src: './src/pieces/Chess_klt45.svg',
		},
		queen: {
			src: './src/pieces/Chess_qlt45.svg',
		},
		bishop: {
			src: './src/pieces/Chess_blt45.svg',
		},
		knight: {
			src: './src/pieces/Chess_nlt45.svg',
		},
		rook: {
			src: './src/pieces/Chess_rlt45.svg',
		},
		pawn: {
			src: './src/pieces/Chess_plt45.svg',
		}
	}
};

const pieceEncodings = {
	'bk': pieces.black.king,
	'wk': pieces.white.king,
	'bq': pieces.black.queen,
	'wq': pieces.white.queen,
	'bb': pieces.black.bishop,
	'wb': pieces.white.bishop,
	'bn': pieces.black.knight,
	'wn': pieces.white.knight,
	'br': pieces.black.rook,
	'wr': pieces.white.rook,
	'bp': pieces.black.pawn,
	'wp': pieces.white.pawn
}

export { pieces, pieceEncodings };