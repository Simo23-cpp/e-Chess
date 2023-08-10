import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

  isnotValid = false;

  constructor(private router: Router, private http: HttpClient) {

  }

  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });


  onLogin() {
    const value = this.loginForm.value;
    console.log('login');
    this.http.post("http://localhost:8080/login", { "username": value.username, "password": value.password })
      .subscribe((res) => {
        if (res) { this.loginForm.reset(); this.router.navigate(["/home"]); }
        else {
          this.isnotValid = true;
          this.loginForm.reset();
          console.log(res);
        }
      })
  }


  signup() {
    console.log('signup');
    this.router.navigate(['/signup']);
  }

}
