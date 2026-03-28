import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: false
})
export class RegisterComponent  implements OnInit {

  formRegister!: FormGroup;

  constructor(
    private ar : FormBuilder
  ) { }

  ngOnInit() {
    this.formRegister = this.ar.group({
      user: [''],
      email: [''],
      password: [''],
      ConfirmPassword: ['']
    });
  }

  registrar() {
  const data = this.formRegister.value;

  if (data.password !== data.confirmPassword) {
    console.log('Las contraseñas no coinciden');
    return;
  }

  console.log(data);
}

}
