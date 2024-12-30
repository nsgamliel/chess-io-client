import { io } from "socket.io-client"; 
import { initGame, movePiece, isInGame } from "./script";

const params = new URLSearchParams(window.location.search);
const prevId = sessionStorage.getItem('chessIoPrevId');
const prevRoom = sessionStorage.getItem('chessIoPrevRoom');

console.log(prevId);
console.log(prevRoom);

const roomElem = document.getElementById("room");
const selfElem = document.getElementById("self");
const oppElem = document.getElementById("opponent");
const createElem = document.getElementById("create");
const joinElem = document.getElementById("join");
const copyElem = document.getElementById("copyLink");

export var gameColor = '';

export const socket = io("https://chess-io-server-gyx6.onrender.com", {
  query: { room: params.get("r") }
});

socket.on("connect", () => {
  console.log(socket.id);
  selfElem.innerHTML = `User: ${socket.id}`;
  sessionStorage.setItem('chessIoPrevId', socket.id);

  const queryRoom = params.get("r");
  if (!queryRoom && prevRoom && prevId) {
    socket.emit("joinRoom", prevRoom, prevId);
  } else if (queryRoom) {
    console.log("has query", queryRoom);
    socket.emit("joinRoom", queryRoom, prevId);
  }

  createElem.addEventListener("click", () => {
    socket.emit("createGame");
  });

  joinElem.addEventListener("keyup", (e) => {
    if (e.key === 'Enter') {
      socket.emit("joinRoom", e.target.value, prevId);
    }
  });
});

socket.on("joinedRoom", (id, oppId, color) => {
  console.log(id, oppId, color);
  
  sessionStorage.setItem('chessIoPrevRoom', id);
  roomElem.innerHTML = `Room: ${id}`;
  oppElem.innerHTML = `Opponent: ${oppId ? oppId : 'waiting...'}`;

  gameColor = color;
  initGame();

  copyElem.addEventListener("click", () => {
    navigator.clipboard.writeText(`http://localhost:5173/?r=${id}`);
  });
});

socket.on("newUser", (id) => {
  oppElem.innerHTML = `Opponent: ${id}`;
});

socket.on("oppMove", (board, rcft) => {
  console.log('oppmove');
  movePiece(board, rcft[0], rcft[1], rcft[2], rcft[3]);
});

// socket.on("reqPrevInfo", () => {
//   socket.emit("retPrevInfo", prevId, prevRoom);
// });