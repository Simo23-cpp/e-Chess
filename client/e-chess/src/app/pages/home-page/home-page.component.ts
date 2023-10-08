import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { SERVER_PATH, SOCKET_IO_PATH } from 'src/app/config';

export interface ScoreResponse {
  _id: string,
  score: number
}

export interface Room {
  room_name: string,
  room_players: number,
  room_time: number
}

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})



export class HomePageComponent implements OnInit, OnDestroy {

  timeGame: number = 0;
  username: any;
  score: any;
  showModalCreateRoom: boolean = false;
  showModal: boolean = false;
  socket = io(SOCKET_IO_PATH);
  Arr_rooms: Room[] = [];

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.username = sessionStorage.getItem('username');
    this.http.get<ScoreResponse[]>(SERVER_PATH + "getScore/" + this.username).subscribe((res) => {
      this.score = res[0].score;
      sessionStorage.setItem("score", this.score);
      this.connectWebSocket();
    })

  }

  ngOnDestroy(): void {
    this.socket.close();
  }

  play(name: string) {
    console.log(name);
    sessionStorage.setItem("room", name);
    this.router.navigate(["/game"]);
  }


  logout() {
    this.router.navigate(["/login"]);
  }

  setTime(time: number) {
    this.timeGame = time;
  }

  openModalCreateRoom() {
    this.showModalCreateRoom = true;
    this.timeGame = 0;
  }

  closeModalCreateRoom() {
    this.timeGame = 0;
    this.showModalCreateRoom = false;
  }


  createRoom(roomName: string) {
    if (roomName.length == 0 || this.timeGame == 0 || this.Arr_rooms.some(item => item.room_name == roomName) || roomName.length > 15) {
      this.showModal = true;
      return;
    }

    sessionStorage.setItem("room", roomName);
    this.showModalCreateRoom = false;
    this.socket.emit("createRoom", roomName, this.timeGame, sessionStorage.getItem("username"), sessionStorage.getItem("score"));
    this.router.navigate(["/game"]);
  }


  connectWebSocket() {

    this.socket.on("connected", () => {
      console.log("connesso alla web socket");
      // this.socket.emit("sendUsername", sessionStorage.getItem("username"), sessionStorage.getItem("score"));
      this.socket.emit("Send_rooms");
    });


    this.socket.on("send_arr", (arr: any) => {
      this.Arr_rooms = arr;
      console.log(this.Arr_rooms)
    })

  }

}
