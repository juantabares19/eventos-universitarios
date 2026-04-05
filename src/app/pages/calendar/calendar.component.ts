import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventosService, Evento } from 'src/app/services/eventos.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  standalone: false
})
export class CalendarComponent implements OnInit {

  eventos: Evento[] = [];
  mesActual: Date = new Date();
  diaSeleccionado: string | null = null;
  eventosDiaSeleccionado: Evento[] = [];
  diasDelMes: (number | null)[] = [];

  // ── Selector de fecha ──
  mostrarSelector: boolean = false;
  mesSelector: number = 0;
  anioSelector: number = new Date().getFullYear();

  nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  nombresMesesCortos = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sept', 'oct', 'nov', 'dic'
  ];

  constructor(
    private eventosService: EventosService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarEventos();
  }

  cargarEventos() {
    this.eventosService.getEventos().subscribe({
      next: (response) => {
        if (response.ok) {
          this.eventos = response.data;
          this.generarCalendario();
        }
      },
      error: (err) => console.error('Error cargando eventos:', err)
    });
  }

  generarCalendario() {
    const anio = this.mesActual.getFullYear();
    const mes = this.mesActual.getMonth();
    const totalDias = new Date(anio, mes + 1, 0).getDate();
    const primerDia = new Date(anio, mes, 1).getDay();

    this.diasDelMes = [
      ...Array(primerDia).fill(null),
      ...Array.from({ length: totalDias }, (_, i) => i + 1)
    ];
  }

  mesAnterior() {
    this.mesActual = new Date(
      this.mesActual.getFullYear(),
      this.mesActual.getMonth() - 1, 1
    );
    this.diaSeleccionado = null;
    this.eventosDiaSeleccionado = [];
    this.generarCalendario();
  }

  mesSiguiente() {
    this.mesActual = new Date(
      this.mesActual.getFullYear(),
      this.mesActual.getMonth() + 1, 1
    );
    this.diaSeleccionado = null;
    this.eventosDiaSeleccionado = [];
    this.generarCalendario();
  }

  getFechaCompleta(dia: number): string {
    const anio = this.mesActual.getFullYear();
    const mes = String(this.mesActual.getMonth() + 1).padStart(2, '0');
    const diaStr = String(dia).padStart(2, '0');
    return `${anio}-${mes}-${diaStr}`;
  }

  tieneEventos(dia: number): boolean {
    const fecha = this.getFechaCompleta(dia);
    return this.eventos.some(e => e.fecha === fecha);
  }

  esHoy(dia: number): boolean {
    const hoy = new Date();
    return (
      dia === hoy.getDate() &&
      this.mesActual.getMonth() === hoy.getMonth() &&
      this.mesActual.getFullYear() === hoy.getFullYear()
    );
  }

  seleccionarDia(dia: number | null) {
    if (!dia) return;
    const fecha = this.getFechaCompleta(dia);
    this.diaSeleccionado = fecha;
    this.eventosDiaSeleccionado = this.eventos.filter(e => e.fecha === fecha);
  }

  esDiaSeleccionado(dia: number): boolean {
    return this.getFechaCompleta(dia) === this.diaSeleccionado;
  }

  irADetalle(eventoId: number) {
    this.router.navigate(['/pages/event-detail', eventoId]);
  }

  // ── Métodos del selector de fecha ──

  abrirSelectorFecha() {
    this.mesSelector = this.mesActual.getMonth();
    this.anioSelector = this.mesActual.getFullYear();
    this.mostrarSelector = true;
  }

  cerrarSelector() {
    this.mostrarSelector = false;
  }

  seleccionarMes(mes: number) {
    this.mesSelector = mes;
  }

  confirmarFecha() {
    this.mesActual = new Date(this.anioSelector, this.mesSelector, 1);
    this.diaSeleccionado = null;
    this.eventosDiaSeleccionado = [];
    this.generarCalendario();
    this.mostrarSelector = false;
  }

  get nombreMesActual(): string {
    return this.nombresMeses[this.mesActual.getMonth()];
  }

  get anioActual(): number {
    return this.mesActual.getFullYear();
  }
}