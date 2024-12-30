import { io } from "socket.io-client"; 
import { initGame, mainMenu, movePiece, setIsInGame } from "./script";

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
const leaveElem = document.getElementById("leave");
const infoElem = document.getElementById("showInfo");
const devtoolsElem = document.getElementById("devTools");

const DEV = false;
const SERVER_URL = DEV ? "http://localhost:3000" : "https://chess-io-server-gyx6.onrender.com";
const CLIENT_URL = DEV ? "http://localhost:5173" : "https://chess-io-client.onrender.com";

export var gameColor = '';

export const socket = io(SERVER_URL, {
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

  infoElem.addEventListener("click", (e) => {
    if (e.target.innerHTML.split(' ')[0] === "Show") {
      devtoolsElem.style.display = "block";
      e.target.innerHTML = "Hide Game Info";  
    } else {
      devtoolsElem.style.display = "none";
      e.target.innerHTML = "Show Game Info";  
    }
    
  });
});

socket.on("joinedRoom", (id, oppId, color) => {
  console.log(id, oppId, color);
  
  sessionStorage.setItem('chessIoPrevRoom', id);
  roomElem.innerHTML = `Room: ${id}`;
  oppElem.innerHTML = `Opponent: ${oppId ? oppId : 'waiting...'}`;

  setIsInGame(oppId ? true : false);

  gameColor = color;
  initGame();

  copyElem.addEventListener("click", (e) => {
    navigator.clipboard.writeText(`${CLIENT_URL}/?r=${id}`);
    e.target.innerHTML = "Copied!";
    setTimeout(() => {
      e.target.innerHTML = "Copy Game Link"
    }, 5000);
  });

  leaveElem.addEventListener("click", () => {
    socket.emit("leaveRoom", id);
  });
});

socket.on("newUser", (id) => {
  oppElem.innerHTML = `Opponent: ${id}`;
  setIsInGame(true);
  initGame();
});

socket.on("oppLeft", () => {
  oppElem.innerHTML = "Opponent: waiting...";
  setIsInGame(false);
  initGame();
});

socket.on("leftRoom", () => {
  roomElem.innerHTML = '';
  sessionStorage.setItem('chessIoPrevRoom', null);
  setIsInGame(false);
  mainMenu();
});

socket.on("oppMove", (board, rcft) => {
  console.log('oppmove');
  movePiece(board, rcft[0], rcft[1], rcft[2], rcft[3]);
});
