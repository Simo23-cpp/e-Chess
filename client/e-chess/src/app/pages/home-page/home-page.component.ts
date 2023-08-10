import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent {
  timeGame: number = 0;
  showAlert: boolean = false;

  constructor(private router: Router) { }

  play() {
    console.log(this.timeGame);
    if (this.timeGame != 0) {
      this.router.navigate(["/game"]);
    }
    else {
      this.showAlert = true;
    }
  }

  logout() {
    console.log("logout");
    this.router.navigate(["/login"]);
  }

  setTime(time: number) {
    this.timeGame = time;
  }
}
