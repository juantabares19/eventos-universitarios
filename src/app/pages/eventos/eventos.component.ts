import { Component, OnInit } from '@angular/core';
import { EventosService, Evento } from 'src/app/services/eventos.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.scss'],
  standalone: false
})
export class EventosComponent implements OnInit {

  eventos: Evento[] = [];
  eventosFiltrados: Evento[] = [];
  categoriaSeleccionada: string = 'Todos';
  cargando: boolean = true;
  usuarioId: string = '';
  favoritosIds: number[] = [];

  categorias: string[] = ['Todos', 'Académico', 'Cultural', 'Deportes', 'Tecnología', 'Otro'];

  constructor(
    private eventosService: EventosService,
    private toastCtrl: ToastController,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit() {}

  // Se ejecuta cada vez que entras al tab de inicio
  async ionViewWillEnter() {
  await this.obtenerSesion();
  this.cargarEventos();
  this.cargarFavoritos();
}

  cargarEventos() {
    this.cargando = true;
    this.eventosService.getEventos().subscribe({
      next: (response) => {
        if (response.ok) {
          this.eventos = response.data;
          this.eventosFiltrados = response.data;
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar eventos:', error);
        this.mostrarToast('Error al cargar los eventos');
        this.cargando = false;
      }
    });
  }

  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    if (categoria === 'Todos') {
      this.eventosFiltrados = this.eventos;
    } else {
      this.eventosFiltrados = this.eventos.filter(e => e.categoria === categoria);
    }
  }

  getColorCategoria(categoria: string): string {
    const colores: { [key: string]: string } = {
      'Académico': 'primary',
      'Cultural': 'secondary',
      'Deportes': 'success',
      'Otro': 'warning'
    };
    return colores[categoria] || 'medium';
  }

  verDetallesEvento(evento: Evento) {
    this.router.navigate(['/pages/event-detail', evento.id]);
  }

  async obtenerSesion() {
  try {
    const session = await this.storageService.getSession();
    if (session?.isLoggedIn && session.user?.id) {
      this.usuarioId = session.user.id;
    }
  } catch (error) {
    console.error('Error obteniendo sesión:', error);
  }
}

cargarFavoritos() {
  if (!this.usuarioId) return;

  this.eventosService.getFavoritos(this.usuarioId).subscribe({
    next: (response) => {
      if (response.ok) {
        this.favoritosIds = (response.data || []).map((fav: any) => fav.evento_id);
      }
    },
    error: (error) => {
      console.error('Error al cargar favoritos:', error);
    }
  });
}

esFavorito(evento: Evento): boolean {
  return this.favoritosIds.includes(evento.id);
}

toggleFavorito(evento: Evento, ev?: Event) {
  ev?.stopPropagation();

  if (!this.usuarioId) {
    this.mostrarToast('Debes iniciar sesión');
    return;
  }

  if (this.esFavorito(evento)) {
    this.eventosService.removeFavorito(evento.id, this.usuarioId).subscribe({
      next: async (response) => {
        if (response.ok) {
          this.favoritosIds = this.favoritosIds.filter(id => id !== evento.id);
          await this.mostrarToast('Eliminado de favoritos');
        }
      }
    });
  } else {
    this.eventosService.addFavorito(evento.id, this.usuarioId).subscribe({
      next: async (response) => {
        if (response.ok) {
          this.favoritosIds.push(evento.id);
          await this.mostrarToast('Agregado a favoritos');
        }
      }
    });
  }
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