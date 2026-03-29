import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  //Formulario reactivo para el login
  formLogin!: FormGroup;
  
  //Inyectar dependencias necesarias
  constructor(
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private router: Router,
    private storageService: StorageService
  ) {}
  
  //Inicializar el formulario con validaciones
  ngOnInit(): void {
    this.formLogin = this.fb.group({
      correo: ['', [
    Validators.required,
    Validators.pattern(/^[a-zA-Z0-9._%+-]+@(miremington\.edu\.co|uniremington\.edu\.co)$/)
  ]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

   //Método para iniciar sesión
  async iniciarSesion(): Promise<void> {

    // Validar que el formulario esté completo y correcto
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      await this._showToastMsg('Completa correctamente los campos');
      return;
    }
    // Obtener los valores del formulario
    const { correo, password } = this.formLogin.value;

    // Intentar iniciar sesión con el correo y contraseña proporcionados
    try {
      const user = await this.storageService.findUserByEmail(correo);

      // Si el usuario no existe, mostrar mensaje de error
      if (!user) {
        await this._showToastMsg('El usuario no existe');
        return;
      }
      // Generar el hash de la contraseña ingresada para compararlo con el almacenado
      const passwordHash = await this.sha256(password);

      // Si el hash de la contraseña no coincide, mostrar mensaje de error
      if (user.password_hash !== passwordHash) {
        await this._showToastMsg('Usuario o contraseña incorrectos');
        return;
      }
      
      // Si el inicio de sesión es exitoso, guardar la sesión y redirigir al dashboard
      await this.storageService.setSession({
        id: user.id,
        nombre: user.nombre,
        correo: user.correo
      });
       // Limpiar el formulario, mostrar mensaje de bienvenida y redirigir al dashboard
      this.formLogin.reset();
      await this._showToastMsg(`Bienvenida, ${user.nombre}`);
      this.router.navigate(['/pages/dashboard']);

      //mostrar errores en consola y mensaje de error al usuario
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      await this._showToastMsg('Ocurrió un error al iniciar sesión');
    }
  }

  // Método para generar un hash SHA-256 de la contraseña
  private async sha256(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

    // Método privado para mostrar mensajes de toast
  private async _showToastMsg(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
    });
    await toast.present();
  }
}
