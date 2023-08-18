import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { ChessPieces, ChessPiecesCodes } from 'src/app/models/chess-pieces';
import { initialBoardPosition } from 'src/app/models/initial-board-position';


@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.css']
})
export class GamePageComponent implements OnInit, OnDestroy {

  ngOnInit(): void {
    this.boardPosition = JSON.parse(JSON.stringify(initialBoardPosition));
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.socket.emit("exit", sessionStorage.getItem("username"));
    this.socket.close();
    this.router.navigate(["/home"]);
  }


  letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  numbers = [8, 7, 6, 5, 4, 3, 2, 1];
  /*/possibleMoves: string[] = [];
  consumableMoves: string[] = [];*/
  selectedElem: any = '';
  isboardRotated: boolean = false;
  msg = new FormControl('');
  //boolean for handle the role
  isBlack = false;
  isWhite = false;
  isWatcher = false;
  //players
  playerWhite: string = "";
  playerBlack: string = "";
  //array for chat
  chat_message: string[] = [];
  history: string[] = [];
  //array for moves
  moves: string[] = [];
  cellValue: any;
  //loader
  isLoading: boolean = true;
  //modal for game finish
  isFinish: boolean = false;
  //socket.io socket
  socket = io("ws://localhost:3000");
  counter: number = 0;
  boardPosition: any;

  constructor(private router: Router) { }

  getPieceCodes(row: any, col: any) {
    let posVal = row + col;
    if (this.boardPosition[posVal] === '') return;
    let pieceName = ChessPieces[this.boardPosition[posVal].name]
    //console.log(pieceName)
    return ChessPiecesCodes[pieceName];
  }

  selectCell(row: any, col: number) {

    console.log(this.boardPosition)

    console.log("mosse" + this.moves);
    this.cellValue = row + col;
    let piece = this.getPieceCodes(row, col);
    if (this.isWhite && (this.counter % 2) == 0) {
      if (piece != undefined && (piece == ChessPiecesCodes.WhitePawn || piece == ChessPiecesCodes.WhiteRook || piece == ChessPiecesCodes.WhiteQueen || piece == ChessPiecesCodes.WhiteKnight || piece == ChessPiecesCodes.WhiteKing || piece == ChessPiecesCodes.WhiteBishop)) {
        console.log(this.getPieceCodes(row, col))
        this.socket.emit("PossibleMovesReq", this.cellValue, sessionStorage.getItem("username"));
      }
      else {



        if (this.moves.includes(this.cellValue)) {
          //this.move(this.cellValue, this.selectedElem);
          this.socket.emit("movePiece", this.cellValue, this.selectedElem, sessionStorage.getItem("username"));
        }
        this.clearSelectedCells();
        this.selectedElem = "";
      }

    }

    if (this.isBlack && (this.counter % 2) == 1) {
      if (piece != undefined && (piece == ChessPiecesCodes.BlackPawn || piece == ChessPiecesCodes.BlackRook || piece == ChessPiecesCodes.BlackQueen || piece == ChessPiecesCodes.BlackKnight || piece == ChessPiecesCodes.BlackKing || piece == ChessPiecesCodes.BlackBishop)) {
        console.log("pezzo" + this.getPieceCodes(row, col))
        this.socket.emit("PossibleMovesReq", this.cellValue, sessionStorage.getItem("username"));
      }
      else {



        if (this.moves.includes(this.cellValue)) {
          //this.move(this.cellValue, this.selectedElem);
          this.socket.emit("movePiece", this.cellValue, this.selectedElem, sessionStorage.getItem("username"));
        }
        this.clearSelectedCells();
        this.selectedElem = "";
      }

    }
    // pawn
    this.selectedElem = this.cellValue;
    /* let pieceObj = initialBoardPosition[this.cellValue];*/


  }

  move(n_position: any, o_position: any) {
    this.boardPosition[n_position] =
      this.boardPosition[o_position];
    this.boardPosition[o_position] = '';

    this.selectedElem = '';
    this.clearSelectedCells();
  }

  /*
    getPossiblePawnMoves(pieceObj: any, row: any, col: number) {
      let moveArr: string[] = [];
      let consumableArr: string[] = [];
      if (pieceObj.color === 'white') {
        let hasBlockingPiece = initialBoardPosition[row + (col + 1)] !== '';
  
        if (this.letters.indexOf(row) === this.letters.length - 1) {
          consumableArr = [
            this.letters[this.letters.indexOf(row) - 1] + (col + 1),
          ];
        } else if (this.letters.indexOf(row) === 0) {
          consumableArr = [
            this.letters[this.letters.indexOf(row) + 1] + (col + 1),
          ];
        } else {
          consumableArr = [
            this.letters[this.letters.indexOf(row) + 1] + (col + 1),
            this.letters[this.letters.indexOf(row) - 1] + (col + 1),
          ];
        }
  
        if (hasBlockingPiece) {
          moveArr = [];
        } else if (pieceObj.isFirstMove) {
          moveArr = [row + (col + 1), row + (col + 2)];
        } else {
          moveArr = [row + (col + 1)];
        }
      }
      if (pieceObj.color === 'black') {
        let hasBlockingPiece = initialBoardPosition[row + (col - 1)] !== '';
  
        if (this.letters.indexOf(row) === this.letters.length - 1) {
          consumableArr = [
            this.letters[this.letters.indexOf(row) - 1] + (col - 1),
          ];
        } else if (this.letters.indexOf(row) === 0) {
          consumableArr = [
            this.letters[this.letters.indexOf(row) + 1] + (col - 1),
          ];
        } else {
          consumableArr = [
            this.letters[this.letters.indexOf(row) + 1] + (col - 1),
            this.letters[this.letters.indexOf(row) - 1] + (col - 1),
          ];
        }
  
        if (hasBlockingPiece) {
          moveArr = [];
        } else if (pieceObj.isFirstMove) {
          moveArr = [row + (col - 1), row + (col - 2)];
        } else {
          moveArr = [row + (col - 1)];
        }
      }
  
      moveArr.forEach((el, i) => {
        if (initialBoardPosition[el] !== '') {
          moveArr.splice(i, 1);
        }
      });
  
      consumableArr = consumableArr.filter(function (el) {
        let boardPos = initialBoardPosition[el];
        return (
          boardPos !== '' && pieceObj.color !== initialBoardPosition[el].color
        );
      });
  
      return { move: moveArr, consumable: consumableArr };
    }
  
    getConsumableArr() { }
  */
  rotateBoard() {
    if (this.isboardRotated) {
      this.letters.sort((a, b) => 0 - (a > b ? -1 : 1));
      this.numbers.sort((a, b) => 0 - (a > b ? 1 : -1));
    } else {
      this.letters.sort((a, b) => 0 - (a > b ? 1 : -1));
      this.numbers.sort((a, b) => 0 - (a > b ? -1 : 1));
    }
    this.isboardRotated = !this.isboardRotated;
    /*const username = sessionStorage.getItem('username');
const message = "private message";
this.socket.emit("chat private", `${username}: ${message}`, sessionStorage.getItem("username"));*/
  }

  clearSelectedCells() {
    const elems = Array.from(
      document.getElementsByClassName(
        'possible-move-class'
      ) as HTMLCollectionOf<HTMLElement>
    );
    elems.forEach((el) => {
      el.classList.remove('possible-move-class');
    });
  }



  //funciotn for modal
  exit() {
    this.isFinish = true;
  }

  //funcition for chat
  sendMsg() {
    const username = sessionStorage.getItem('username');
    let message = this.msg.value;
    this.socket.emit("chat message", `${username}: ${message}`);
    this.msg.reset();
  }

  //funciotn for close modal

  close() {
    this.isFinish = false;
    this.router.navigate(["/home"])
  }

  displayMessage(message: any) {
    console.log(message);

  }



  connectWebSocket() {

    // Event emitted on successful connection
    this.socket.on("connected", (message: any) => {
      this.socket.emit("sendUsername", sessionStorage.getItem("username"));
      this.displayMessage(message);

    });

    this.socket.on("setWhite", (bool) => {
      console.log(sessionStorage.getItem("username") + "is white");
      this.isWhite = bool;

    })

    this.socket.on("setBlack", (bool) => {
      console.log(sessionStorage.getItem("username") + "is black");
      this.isBlack = bool;
    })

    this.socket.on("setWatcher", (bool, arr, story, contatore) => {
      console.log(sessionStorage.getItem("username") + "is watcher");
      this.isWatcher = bool;
      let pari = 0;
      let dispari = 1;
      for (let i = 0; i < arr.length / 2; i++) {
        let from = arr[pari];
        let to = arr[dispari];
        this.move(to, from);
        pari = pari + 2;
        dispari = dispari + 2;
      }
      this.history = story;
      this.counter = contatore;
      alert("you are watcher, you can only watch the game at this moment");
    })

    this.socket.on("setLoader", (bool) => {
      this.isLoading = bool;
    })

    //set the players
    this.socket.on("setPlayer", (white, black) => {
      if (this.isWhite) {
        this.playerWhite = sessionStorage.getItem("username")!;
        this.playerBlack = black;
      }
      if (this.isBlack) {
        this.playerWhite = white;
        this.playerBlack = sessionStorage.getItem("username")!;
      }
      if (this.isWatcher) {
        this.playerBlack = black;
        this.playerWhite = white;
      }
    })

    // Event emitted on message received
    this.socket.on("chat message", (message: any) => {
      console.log("Received:", message);
      this.chat_message.push(message);
    });



    //emitted only for players that play
    this.socket.on("chat private", (message: any) => {
      this.moves = message;
      console.log("moves" + this.moves);
      this.clearSelectedCells();
      this.moves.forEach((element: any) => {
        console.log(element);
        let elem = document.getElementById(element) as HTMLElement;
        elem.classList.add('possible-move-class');

      });
    });

    this.socket.on("moveFrontEnd", (new_p, old_p) => {
      this.counter++;
      this.move(new_p, old_p);
      let piece = this.getPieceCodes(new_p[0], new_p[1]);
      if (piece == ChessPiecesCodes.WhiteKing && old_p == "E1" && new_p == "G1") {
        this.move("F1", "H1");
        this.history.push(this.counter + piece + " O-O ");
        this.socket.emit("arrocco", "F1", "H1", sessionStorage.getItem("username"));
      }
      else if (piece == ChessPiecesCodes.WhiteKing && old_p == "E1" && new_p == "C1") {
        this.move("D1", "A1");
        this.history.push(this.counter + piece + " O-O-O ");
        this.socket.emit("arrocco", "D1", "A1", sessionStorage.getItem("username"));
      }
      else if (piece == ChessPiecesCodes.BlackKing && old_p == "E8" && new_p == "G8") {
        this.move("F8", "H8");
        this.history.push(this.counter + piece + " O-O ");
        this.socket.emit("arrocco", "F8", "H8", sessionStorage.getItem("username"));
      }
      else if (piece == ChessPiecesCodes.BlackKing && old_p == "E8" && new_p == "C8") {
        this.move("D8", "A8");
        this.history.push(this.counter + piece + " O-O-O ");
        this.socket.emit("arrocco", "D8", "A8", sessionStorage.getItem("username"));
      }
      else {
        this.history.push(this.counter + piece + new_p + "  ");
      }
      this.socket.emit("refreshHistory", this.history, this.counter);
      console.log("history" + this.history);
      this.moves = [];
    })

    this.socket.on("setFinish", (bool) => {
      this.isFinish = bool;
      this.socket.emit("exit", sessionStorage.getItem("username"));
      this.socket.close();
    })

    // Event emitted on not found error
    this.socket.on("connect_error", () => {
      alert("Socket closed");
    });




  }
}


