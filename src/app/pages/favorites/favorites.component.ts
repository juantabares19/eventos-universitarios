import { Component, OnInit } from '@angular/core';
import { EventosService } from 'src/app/services/eventos.service';
import { ToastController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
  standalone: false
})
export class FavoritesComponent implements OnInit {

  favoritos: any[] = [];
  usuarioId: string = '';
  cargando: boolean = true;

  constructor(
    private eventosService: EventosService,
    private toastCtrl: ToastController,
    private storageService: StorageService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.obtenerSesion();
    this.cargarFavoritos();
  }

  async ionViewWillEnter() {
    await this.obtenerSesion();
    this.cargarFavoritos();
  }

  async obtenerSesion() {
    try {
      const session = await this.storageService.getSession();

      if (session?.isLoggedIn && session.user?.id) {
        this.usuarioId = session.user.id;
      } else {
        await this.mostrarToast('No se encontró la sesión del usuario');
      }
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      await this.mostrarToast('Error al obtener la sesión');
    }
  }

  cargarFavoritos() {
    if (!this.usuarioId) {
      this.cargando = false;
      return;
    }

    this.cargando = true;

    this.eventosService.getFavoritos(this.usuarioId).subscribe({
      next: (response) => {
        if (response.ok) {
          this.favoritos = response.data || [];
        }
        this.cargando = false;
      },
      error: async (error) => {
        console.error('Error al cargar favoritos:', error);
        this.cargando = false;
        await this.mostrarToast('Error al cargar favoritos');
      }
    });
  }
toggleFavorito(evento: any, ev?: Event) {
  ev?.stopPropagation();

  if (!this.usuarioId) {
    this.mostrarToast('Debes iniciar sesión');
    return;
  }

  this.eventosService.removeFavorito(evento.evento_id, this.usuarioId).subscribe({
    next: async (response) => {
      if (response.ok) {
        this.favoritos = this.favoritos.filter(f => f.evento_id !== evento.evento_id);
        await this.mostrarToast('Eliminado de favoritos');
      }
    },
    error: async (error) => {
      console.error('Error al eliminar favorito:', error);
      await this.mostrarToast('Error al eliminar favorito');
    }
  });
}

verDetalle(eventoId: number) {
  this.router.navigate(['/pages/event-detail', eventoId]);
}


  private async mostrarToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top'
    });
    await toast.present();
  }
}
