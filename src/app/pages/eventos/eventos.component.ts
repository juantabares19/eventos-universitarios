import { Component, OnInit } from '@angular/core';
import { EventosService, Evento } from 'src/app/services/eventos.service';
import { ToastController } from '@ionic/angular';

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

  categorias: string[] = ['Todos', 'Académico', 'Cultural', 'Deportes'];

  constructor(
    private eventosService: EventosService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.cargarEventos();
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

  private async mostrarToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top'
    });
    await toast.present();
  }
}