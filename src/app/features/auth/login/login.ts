import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  loginModel!: LoginRequest;
  isLoading = false;
  
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
      this.isLoading = true;
      this.loginModel = {
        username: this.loginForm.value.email,
        password: this.loginForm.value.password
      };
      this._authService.login(this.loginModel).subscribe({
        next: () => {
          this.isLoading = false;
          toast.success('Inicio de sesión exitoso', {
            description: 'Bienvenido de nuevo',
            duration: 2000
          });
          this._router.navigate(['/pages/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error:', error);
          const errorMsg = error.error?.detail || 'Credenciales incorrectas. Por favor, intenta de nuevo.';
          toast.error('Error al iniciar sesión', {
            description: errorMsg,
            duration: 4000
          });
        }
      });
    } else {
      toast.error('Formulario inválido', {
        description: 'Por favor, completa todos los campos correctamente',
        duration: 3000
      });
    }
  } 
}
