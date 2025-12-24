import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  loginModel!: LoginRequest;
  
  constructor(private _authService: AuthService, private _formBuilder: FormBuilder,
    private _router: Router
  ) {
    
  }

  ngOnInit(): void {
    this.loginForm = this.initForm();
  }

  initForm():FormGroup{
    return this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  login():void{
    if(this.loginForm.valid){
      this.loginModel = {
        username: this.loginForm.value.email,
        password: this.loginForm.value.password
      };
      this._authService.login(this.loginModel).subscribe({
        next: () => {
          this._router.navigate(['/pages/dashboard']);
        },
        error: (error) => {
          console.error('Login error:', error);
        }
      });
    }
  } 
}
