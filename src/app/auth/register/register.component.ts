import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: false
})
export class RegisterComponent implements OnInit {

  //Formulario reactivo para el registro
  formRegister!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private router: Router,
    private storageService: StorageService
  ) {}

  //Campos obligatorios y validación de formato para el correo
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

  //Método para registrar un nuevo usuario
  async registrar(): Promise<void> {

    //validar que el formulario esté completo y correcto
    if (this.formRegister.invalid) {
      this.formRegister.markAllAsTouched();
      await this._showToastMsg('Completa todos los campos');
      return;
    }
    //Obtener los valores del formulario
    const { nombre, correo, password, confirmPassword } = this.formRegister.value;

    // Validar que ambas contraseñas coincidan
    if (password !== confirmPassword) {
      await this._showToastMsg('Las contraseñas no coinciden');
      return;
    }

    try {
      // Verificar si ya existe un usuario con este correo
      const existingUser = await this.storageService.findUserByEmail(correo);
      
      // Si el usuario ya existe, mostrar mensaje de error
      if (existingUser) {
        await this._showToastMsg('El correo ya está registrado');
        this.formRegister.reset(); 
        return;
      }

      // Hash de contraseña 
      const passwordHash = await this.sha256(password);
      
      // Crear un nuevo usuario con los datos del formulario
      const newUser = {
        id: crypto.randomUUID(),
        nombre,
        correo,
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      // Guardar el nuevo usuario en el almacenamiento local
      await this.storageService.addUser(newUser);
      
      // Mostrar mensaje de éxito y redirigir al login
      await this._showToastMsg('Usuario registrado correctamente');
      this.formRegister.reset();
      this.router.navigate(['/auth/login']);

      
    } catch (error) {
      console.error(error);
      await this._showToastMsg('Error al registrar usuario');
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
