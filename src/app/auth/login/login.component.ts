import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent  implements OnInit {

  formLogin!: FormGroup;

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.formLogin = this.fb.group({
      user: [''],
      password: ['']
    });
  }

  // Método para iniciar sesión
  iniciarSesion() {
    console.log('Datos del formulario de inicio de sesión:');
    console.log(this.formLogin.value);
  }
}
