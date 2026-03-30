import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  formLogin!: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private router: Router,
    private storageService: StorageService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.formLogin = this.fb.group({
      correo: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@(miremington\.edu\.co|uniremington\.edu\.co)$/)
      ]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async iniciarSesion(): Promise<void> {
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      await this._showToastMsg('Completa correctamente los campos');
      return;
    }

    const { correo, password } = this.formLogin.value;

    try {
      const passwordHash = await this.sha256(password);

      this.authService.postLogin({ correo, password_hash: passwordHash }).subscribe({
        next: async (response: any) => {
          const user = response.data;

          await this.storageService.setSession({
            id: user.id,
            nombre: user.nombre,
            correo: user.correo
          });

          this.formLogin.reset();
          await this._showToastMsg(`¡Bienvenido, ${user.nombre}!`);
          
          // CORRECCIÓN: redirige a eventos, no a dashboard
          this.router.navigate(['/pages/tabs/eventos']);
        },
        error: async (err) => {
          console.error('Error login:', err);
          await this._showToastMsg('Correo o contraseña incorrectos');
        }
      });

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      await this._showToastMsg('Ocurrió un error inesperado');
    }
  }

  private async sha256(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async _showToastMsg(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
    });
    await toast.present();
  }
}