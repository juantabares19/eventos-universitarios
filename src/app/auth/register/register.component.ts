import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { AuthService } from 'src/app/services/auth.service'; // Asegúrate de que esta ruta sea correcta

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: false
})
export class RegisterComponent implements OnInit {

  formRegister!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private router: Router,
    private storageService: StorageService,
    private authService: AuthService // Inyectamos el servicio
  ) {}

  ngOnInit(): void {
    this.formRegister = this.fb.group({
      nombre: ['', [Validators.required]],
      correo: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@(miremington\.edu\.co|uniremington\.edu\.co)$/)
      ]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  async registrar(): Promise<void> {
    if (this.formRegister.invalid) {
      this.formRegister.markAllAsTouched();
      await this._showToastMsg('Completa todos los campos correctamente');
      return;
    }

    const { nombre, correo, password, confirmPassword } = this.formRegister.value;

    if (password !== confirmPassword) {
      await this._showToastMsg('Las contraseñas no coinciden');
      return;
    }

    try {
      const passwordHash = await this.sha256(password);
      
      const newUser = {
        id: crypto.randomUUID(),
        nombre,
        correo,
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // --- CAMBIO HÍBRIDO ---
      // 1. Intentamos registrar en el Backend (SQLite)
      this.authService.postRegister(newUser).subscribe({
        next: async (res: any) => {
          // 2. Si el backend responde OK, guardamos en Storage local
          await this.storageService.addUser(newUser);
          await this._showToastMsg('Usuario registrado correctamente en la nube');
          this.formRegister.reset();
          this.router.navigate(['/auth/login']);
        },
        error: async (err) => {
          console.error(err);
          await this._showToastMsg('El correo ya existe o hubo un error en el servidor');
        }
      });
      
    } catch (error) {
      console.error(error);
      await this._showToastMsg('Error al procesar el registro');
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