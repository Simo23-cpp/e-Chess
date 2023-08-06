import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

  constructor(private router: Router) {

  }


  login() {
    console.log('login');
    this.router.navigate(['/home']);


  }
  signup() {
    console.log('signup');
    this.router.navigate(['/signup']);
  }

}
