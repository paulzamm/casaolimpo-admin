import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  roles = Role;
  isLoading = false;

  constructor(
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.initForm();
  }

  initForm(): FormGroup {
    return this._formBuilder.group({
      cedula: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      confirmPassword: ['', Validators.required],
      rol: [Role.VENDEDOR, Validators.required],
      activo: [true]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  get f() {
    return this.registerForm.controls;
  }

  register(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      
      const { confirmPassword, ...registerData } = this.registerForm.getRawValue();
      
      this._authService.register(registerData as any).subscribe({
        next: () => {
          this.isLoading = false;
          toast.success('Usuario registrado exitosamente', {
            description: 'Redirigiendo al login...',
            duration: 2000
          });
          setTimeout(() => {
            this._router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error en registro:', err);
          const errorMsg = err.error?.detail || 'Error al registrar usuario. Por favor, intenta de nuevo.';
          toast.error('Error en el registro', {
            description: errorMsg,
            duration: 4000
          });
        }
      });
    } else {
      this.markFormGroupTouched(this.registerForm);
      toast.error('Formulario inválido', {
        description: 'Por favor, completa todos los campos correctamente',
        duration: 3000
      });
    }
  }

  private markFormGroupTouched(formGroup: any) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}

