import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent  implements OnInit {

  formLogin!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.formLogin = this.fb.group({
      user: ['', Validators.required, Validators.minLength(5)],
      password: ['', Validators.required]
    });
  }

  // Método para iniciar sesión
  iniciarSesion() {
    console.log('Datos del formulario de inicio de sesión:');

      if (this.formLogin.invalid) {
        this._showToastMsg();
        return;
      }

      //TODO: Servicio para validar login
      
      
      //Redireccionar al dashboard
      this.router.navigate(['/pages/dashboard']); 
  }

  //Metodos Privados
  private async _showToastMsg(){
    const toast = await this.toastCtrl.create({
      message: 'Usuario o contraseña incorrectos',
      duration: 3000
    });
    await toast.present();  
  }
}
