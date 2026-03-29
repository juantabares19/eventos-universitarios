import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { EventosService, Evento } from 'src/app/services/eventos.service';
import { StorageService } from 'src/app/services/storage.service';

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
      this.cargarEvento(Number(id));
    }
  }

  cargarEvento(id: number) {
    this.cargando = true;
    this.eventosService.getEventoById(id).subscribe({
      next: (response) => {
        if (response.ok) {
          this.evento = response.data;
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

  volver() {
    this.router.navigate(['/pages/eventos']);
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