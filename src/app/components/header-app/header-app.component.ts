import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';
import { CerrarSesionComponent } from '../cerrar-sesion/cerrar-sesion.component';

@Component({
  selector: 'app-header-app',
  templateUrl: './header-app.component.html',
  styleUrl: './header-app.component.scss',
  standalone: false
})
export class HeaderAppComponent {

  @Input() titulo: string = '';

  usuario = {
    nombre: '',
    correo: ''
  };

  constructor(
    private popoverCtrl: PopoverController,
    private storageService: StorageService
  ) {}

  async abrirPerfil(ev: any) {
    const session = await this.storageService.getSession();

    if (session?.isLoggedIn) {
      this.usuario = session.user;
    }

    const popover = await this.popoverCtrl.create({
      component: CerrarSesionComponent,
      event: ev,
      cssClass: 'perfil-popover',
      componentProps: {
        nombre: this.usuario.nombre,
        correo: this.usuario.correo
      }
    });

    await popover.present();
  }
}
