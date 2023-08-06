import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

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
