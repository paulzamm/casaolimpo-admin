import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  imports: [RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  registerModel!: User;

  constructor() {}
  ngOnInit(): void {}

}
