import { Component, Input } from '@angular/core';
import { PopoverController, IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cerrar-sesion',
  templateUrl: './cerrar-sesion.component.html',
  styleUrls: ['./cerrar-sesion.component.scss'],
  standalone: false,
})
export class CerrarSesionComponent {
  @Input() nombre: string = '';
  @Input() correo: string = '';

  constructor(
    private popoverCtrl: PopoverController,
    private router: Router,
    private storageService: StorageService
  ) {}

  async cerrarSesion() {
    await this.storageService.clearSession();
    await this.popoverCtrl.dismiss();
    this.router.navigate(['/login']);
  }
}