import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observer } from 'rxjs';

export interface UsernameReq {
  _id: string
  username: string
}

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.css']
})


export class SignupPageComponent {


  constructor(private router: Router, private http: HttpClient) { }

  showAlert: boolean = false;
  usernameExist: boolean = false;

  submitForm = new FormGroup({
    name: new FormControl('', Validators.required),
    surname: new FormControl('', Validators.required),
    username: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirm_pass: new FormControl('', Validators.required)

  });

  async onSubmit() {

    const value = this.submitForm.value;

    if (value.password !== value.confirm_pass) {
      this.showAlert = true;
      this.submitForm.controls.password.setValue("");
      this.submitForm.controls.confirm_pass.setValue("");

      return;
    }

    await this.http.get<UsernameReq[]>("http://localhost:8080/getUsername").subscribe((res) => {
      const usernames = res.map((elem) => { return elem.username });
      const s = usernames.includes(value.username!);
      if (s) {
        this.usernameExist = true;
        this.submitForm.controls.username.setValue("");
        return;
      }

    })

    this.http.post("http://localhost:8080/insertUser", { "name": value.name, "surname": value.surname, "username": value.username, "password": value.password, "score": 0 })
      .subscribe((res) => {
        if (res) { this.submitForm.reset(); this.router.navigate(["/home"]); }
        else {
          console.log(res);
        }
      })







    //
  }
}
