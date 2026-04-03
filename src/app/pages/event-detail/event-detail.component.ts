import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { EventosService, Evento } from 'src/app/services/eventos.service';
import { StorageService } from 'src/app/services/storage.service';
import { NotificationsComponent } from '../notifications/notifications.component';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss'],
  standalone: false
})
export class EventDetailComponent implements OnInit {

  evento: Evento | null = null;
  cargando: boolean = true;
  inscribiendo: boolean = false;
  yaInscrito: boolean = false;
  eventoId: number = 0;
  usuarioId: string | null = null;
  favoritosIds: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventosService: EventosService,
    private storageService: StorageService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventoId = Number(id);
    }
  }

  async ionViewWillEnter() {
    await this.obtenerSesion();
    if (this.usuarioId) {
      this.cargarFavoritos();
    }
    if (this.eventoId) {
      this.cargarEvento(this.eventoId);
    }
  }

  async cargarEvento(id: number) {
    this.cargando = true;
    this.yaInscrito = false;

    const session = await this.storageService.getSession();

    this.eventosService.getEventoById(id).subscribe({
      next: async (response) => {
        if (response.ok) {
          this.evento = response.data;

          if (session && session.isLoggedIn) {
            this.eventosService.getInscripciones(session.user.id).subscribe({
              next: (res) => {
                if (res.ok) {
                  this.yaInscrito = res.data.some(
                    (i: any) => i.evento_id === id
                  );
                }
              },
              error: (error) => {
                console.error('Error al verificar inscripción:', error);
              }
            });
          }
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar evento:', error);
        this.mostrarToast('Error al cargar el evento');
        this.cargando = false;
      }
    });
  }

  async inscribirse() {
    const session = await this.storageService.getSession();
    if (!session || !session.isLoggedIn) {
      this.mostrarToast('Debes iniciar sesión para inscribirte');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.evento) return;

    const loading = await this.loadingCtrl.create({
      message: 'Procesando inscripción...'
    });
    await loading.present();

    this.eventosService.inscribirse({
      evento_id: this.evento.id,
      usuario_id: session.user.id,
      usuario_nombre: session.user.nombre,
      usuario_correo: session.user.correo
    }).subscribe({
      next: async (response) => {
        await loading.dismiss();
        if (response.ok) {
          this.yaInscrito = true;
          this.mostrarToast('¡Inscripción exitosa!');
          if (this.evento) {
            this.evento.cupos_disponibles--;

            // ── Notificación de inscripción exitosa ──
            NotificationsComponent.agregarNotificacionGlobal({
              id: `inscripcion_${this.evento.id}_${Date.now()}`,
              tipo: 'inscripcion',
              titulo: '¡Inscripción confirmada!',
              mensaje: `Te inscribiste exitosamente a "${this.evento.titulo}". El evento es el ${this.evento.fecha} a las ${this.evento.hora} en ${this.evento.lugar}.`,
              fecha: new Date().toISOString(),
              leida: false,
              eventoId: this.evento.id
            });
          }
        } else {
          this.mostrarToast(response.message || 'Error al inscribirse');
        }
      },
      error: async (error) => {
        await loading.dismiss();
        const msg = error.error?.message || 'Error al inscribirse';
        this.mostrarToast(msg);
      }
    });
  }

  async cancelarInscripcion() {
    const session = await this.storageService.getSession();
    if (!session || !session.isLoggedIn || !this.evento) return;

    const loading = await this.loadingCtrl.create({
      message: 'Cancelando inscripción...'
    });
    await loading.present();

    this.eventosService.cancelarInscripcion(this.evento.id, session.user.id).subscribe({
      next: async (response) => {
        await loading.dismiss();
        if (response.ok) {
          this.yaInscrito = false;
          this.mostrarToast('Inscripción cancelada');
          if (this.evento) {
            this.evento.cupos_disponibles++;

            // ── Notificación de cancelación ──
            NotificationsComponent.agregarNotificacionGlobal({
              id: `cancelacion_${this.evento.id}_${Date.now()}`,
              tipo: 'cancelacion',
              titulo: 'Inscripción cancelada',
              mensaje: `Cancelaste tu inscripción a "${this.evento.titulo}". Tu cupo ha sido liberado.`,
              fecha: new Date().toISOString(),
              leida: false,
              eventoId: this.evento.id
            });
          }
        } else {
          this.mostrarToast(response.message || 'Error al cancelar');
        }
      },
      error: async (error) => {
        await loading.dismiss();
        this.mostrarToast('Error al cancelar la inscripción');
      }
    });
  }

  volver() {
    this.router.navigate(['/pages/tabs/eventos']);
  }

  async obtenerSesion() {
    try {
      const session = await this.storageService.getSession();
      if (session?.isLoggedIn && session.user?.id) {
        this.usuarioId = session.user.id;
      } else {
        this.usuarioId = null;
      }
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      this.usuarioId = null;
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
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.esFavorito(evento)) {
      this.eventosService.removeFavorito(evento.id, this.usuarioId).subscribe({
        next: async (response) => {
          if (response.ok) {
            this.favoritosIds = this.favoritosIds.filter(id => id !== evento.id);
            await this.mostrarToast('Eliminado de favoritos');

            // ── Notificación de favorito eliminado ──
            NotificationsComponent.agregarNotificacionGlobal({
              id: `fav_remove_${evento.id}_${Date.now()}`,
              tipo: 'cancelacion',
              titulo: 'Eliminado de favoritos',
              mensaje: `Quitaste "${evento.titulo}" de tu lista de favoritos.`,
              fecha: new Date().toISOString(),
              leida: false,
              eventoId: evento.id
            });
          } else {
            await this.mostrarToast(response.message || 'No se pudo eliminar de favoritos');
          }
        },
        error: async (error) => {
          console.error('Error al eliminar favorito:', error);
          await this.mostrarToast('Error al eliminar de favoritos');
        }
      });
    } else {
      this.eventosService.addFavorito(evento.id, this.usuarioId).subscribe({
        next: async (response) => {
          if (response.ok) {
            this.favoritosIds.push(evento.id);
            await this.mostrarToast('Agregado a favoritos');

            // ── Notificación de favorito agregado ──
            NotificationsComponent.agregarNotificacionGlobal({
              id: `fav_add_${evento.id}_${Date.now()}`,
              tipo: 'nuevo',
              titulo: 'Agregado a favoritos',
              mensaje: `Guardaste "${evento.titulo}" en tu lista de favoritos.`,
              fecha: new Date().toISOString(),
              leida: false,
              eventoId: evento.id
            });
          } else {
            await this.mostrarToast(response.message || 'No se pudo agregar a favoritos');
          }
        },
        error: async (error) => {
          console.error('Error al agregar favorito:', error);
          await this.mostrarToast('Error al agregar a favoritos');
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