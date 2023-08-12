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

    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.socket.close();
    this.router.navigate(["/home"])
  }


  letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  numbers = [8, 7, 6, 5, 4, 3, 2, 1];
  possibleMoves: string[] = [];
  consumableMoves: string[] = [];
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

  //loader
  isLoading: boolean = true;
  //modal for game finish
  isFinish: boolean = false;
  //socket.io socket
  socket = io("ws://localhost:3000");

  constructor(private router: Router) { }

  getPieceCodes(row: any, col: any) {
    let posVal = row + col;
    if (initialBoardPosition[posVal] === '') return;
    let pieceName = ChessPieces[initialBoardPosition[posVal].name]
    //console.log(pieceName)
    return ChessPiecesCodes[pieceName];
  }

  selectCell(row: any, col: number) {
    this.clearSelectedCells();
    let cellValue = row + col;
    if (
      initialBoardPosition[cellValue] === '' &&
      this.possibleMoves.length > 0 &&
      this.selectedElem !== ''
    ) {
      if (this.possibleMoves.indexOf(cellValue) !== -1) {
        initialBoardPosition[cellValue] =
          initialBoardPosition[this.selectedElem];
        initialBoardPosition[cellValue].isFirstMove = false;
        initialBoardPosition[this.selectedElem] = '';
      }
      this.possibleMoves = [];
      this.selectedElem = '';
      return;
    }

    // pawn
    this.selectedElem = cellValue;
    let pieceObj = initialBoardPosition[cellValue];

    if (
      pieceObj.name == ChessPieces.WhitePawn ||
      pieceObj.name == ChessPieces.BlackPawn
    ) {
      let pawnMoves = this.getPossiblePawnMoves(pieceObj, row, col);
      this.possibleMoves = pawnMoves.move;
      this.consumableMoves = pawnMoves.consumable;

      this.consumableMoves.forEach((element) => {
        let elem = document.getElementById(element) as HTMLElement;
        elem.classList.add('possible-move-class');
      });

      this.possibleMoves.forEach((element) => {
        let elem = document.getElementById(element) as HTMLElement;
        elem.classList.add('possible-move-class');
      });
    }
  }

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

    this.socket.on("setWatcher", (bool) => {
      console.log(sessionStorage.getItem("username") + "is watcher");
      this.isWatcher = bool;
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
      console.log("Received:", message)
      this.displayMessage(message);
    });

    this.socket.on("setFinish", (bool) => {
      this.isFinish = bool;
    })

    // Event emitted on not found error
    this.socket.on("connect_error", () => {
      alert("Socket closed");
    });




  }
}


