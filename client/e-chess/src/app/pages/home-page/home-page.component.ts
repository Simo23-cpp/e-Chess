import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SERVER_PATH } from 'src/app/config';

export interface ScoreResponse {
  _id: string,
  score: number
}

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  username: any;
  score: any;

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.username = sessionStorage.getItem('username');
    this.http.get<ScoreResponse[]>(SERVER_PATH + "getScore/" + this.username).subscribe((res) => {
      this.score = res[0].score;
      sessionStorage.setItem("score", this.score);
    })
  }

  play() {
    this.router.navigate(["/game"]);
  }


  logout() {
    this.router.navigate(["/login"]);
  }


}
