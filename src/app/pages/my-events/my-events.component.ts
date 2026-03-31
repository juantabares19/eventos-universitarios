import { Component, OnInit } from '@angular/core';
import { EventosService } from 'src/app/services/eventos.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-events',
  templateUrl: './my-events.component.html',
  styleUrls: ['./my-events.component.scss'],
  standalone: false
})
export class MyEventsComponent implements OnInit {

  inscripciones: any[] = [];
  cargando: boolean = true;

  constructor(
    private eventosService: EventosService,
    private storageService: StorageService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit() {}

  // Se ejecuta cada vez que entras a la tab
  async ionViewWillEnter() {
    await this.cargarInscripciones();
  }

  async cargarInscripciones() {
    this.cargando = true;
    const session = await this.storageService.getSession();

    if (!session || !session.isLoggedIn) {
      this.cargando = false;
      return;
    }

    this.eventosService.getInscripciones(session.user.id).subscribe({
      next: (response) => {
        if (response.ok) {
          this.inscripciones = response.data;
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar inscripciones:', error);
        this.mostrarToast('Error al cargar tus eventos');
        this.cargando = false;
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