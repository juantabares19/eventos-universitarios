import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventosService, Evento } from 'src/app/services/eventos.service';
import { StorageService } from 'src/app/services/storage.service';

export interface Notificacion {
  id: string;
  tipo: 'inscripcion' | 'cancelacion' | 'recordatorio' | 'cupos' | 'nuevo';
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  eventoId?: number;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  standalone: false
})
export class NotificationsComponent implements OnInit, OnDestroy {

  notificaciones: Notificacion[] = [];
  cargando: boolean = true;
  private intervalo: any;

  constructor(
    private eventosService: EventosService,
    private storageService: StorageService
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.cargarNotificaciones();
    this.generarNotificacionesAutomaticas();
    this.intervalo = setInterval(() => {
      this.cargarNotificaciones();
    }, 5000);
  }

  ionViewWillLeave() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  cargarNotificaciones() {
    const guardadas = localStorage.getItem('notificaciones');
    this.notificaciones = guardadas ? JSON.parse(guardadas) : [];
    this.cargando = false;
  }

  // ── Obtiene IDs descartados (leídos o eliminados manualmente) ──
  getDescartados(): string[] {
    const guardados = localStorage.getItem('notificaciones_descartadas');
    return guardados ? JSON.parse(guardados) : [];
  }

  // ── Agrega un ID a la lista de descartados ──
  agregarDescartado(id: string) {
    const descartados = this.getDescartados();
    if (!descartados.includes(id)) {
      descartados.push(id);
      localStorage.setItem('notificaciones_descartadas', JSON.stringify(descartados));
    }
  }

  async generarNotificacionesAutomaticas() {
    const session = await this.storageService.getSession();
    if (!session?.isLoggedIn) return;

    const descartados = this.getDescartados();

    // ── Recordatorios de eventos próximos ──
    this.eventosService.getInscripciones(session.user.id).subscribe({
      next: (response) => {
        if (!response.ok) return;

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        response.data.forEach((inscripcion: any) => {
          const fechaEvento = new Date(inscripcion.fecha + 'T00:00:00');
          const diasRestantes = Math.ceil(
            (fechaEvento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diasRestantes >= 0 && diasRestantes <= 3) {
            const idNotif = `recordatorio_${inscripcion.evento_id}_${inscripcion.fecha}`;

            // No generar si ya existe en la lista O si fue descartada
            const yaExiste = this.notificaciones.some(n => n.id === idNotif);
            const fueDescartada = descartados.includes(idNotif);

            if (!yaExiste && !fueDescartada) {
              const textoTiempo =
                diasRestantes === 0 ? 'es HOY' :
                diasRestantes === 1 ? 'es mañana' :
                `es en ${diasRestantes} días`;

              this.agregarNotificacion({
                id: idNotif,
                tipo: 'recordatorio',
                titulo: 'Recordatorio de evento',
                mensaje: `"${inscripcion.titulo}" ${textoTiempo} a las ${inscripcion.hora} en ${inscripcion.lugar}. ¡No te lo pierdas!`,
                fecha: new Date().toISOString(),
                leida: false,
                eventoId: inscripcion.evento_id
              });
            }
          }
        });
      },
      error: () => {}
    });

    // ── Avisos de cupos bajos ──
    this.eventosService.getEventos().subscribe({
      next: (response) => {
        if (!response.ok) return;

        response.data.forEach((evento: Evento) => {
          if (evento.cupos_disponibles > 0 && evento.cupos_disponibles <= 10) {
            const idNotif = `cupos_${evento.id}`;

            // No generar si ya existe O si fue descartada
            const yaExiste = this.notificaciones.some(n => n.id === idNotif);
            const fueDescartada = descartados.includes(idNotif);

            if (!yaExiste && !fueDescartada) {
              this.agregarNotificacion({
                id: idNotif,
                tipo: 'cupos',
                titulo: '¡Cupos limitados!',
                mensaje: `Solo quedan ${evento.cupos_disponibles} cupo${evento.cupos_disponibles === 1 ? '' : 's'} en "${evento.titulo}". ¡Inscríbete antes de que se agoten!`,
                fecha: new Date().toISOString(),
                leida: false,
                eventoId: evento.id
              });
            }
          }
        });
      },
      error: () => {}
    });
  }

  agregarNotificacion(notif: Notificacion) {
    this.notificaciones.unshift(notif);
    this.guardarNotificaciones();
  }

  // ── Al marcar leída, también la registra como descartada ──
  marcarLeida(notif: Notificacion) {
    notif.leida = true;
    this.agregarDescartado(notif.id);
    this.guardarNotificaciones();
  }

  marcarTodasLeidas() {
    this.notificaciones.forEach(n => {
      n.leida = true;
      this.agregarDescartado(n.id);
    });
    this.guardarNotificaciones();
  }

  // ── Al eliminar, también la registra como descartada ──
  eliminarNotificacion(id: string) {
    this.agregarDescartado(id);
    this.notificaciones = this.notificaciones.filter(n => n.id !== id);
    this.guardarNotificaciones();
  }

  // ── Al limpiar todas, descarta todas las automáticas ──
  limpiarTodas() {
    this.notificaciones.forEach(n => {
      // Solo descarta las automáticas (cupos y recordatorios)
      if (n.tipo === 'cupos' || n.tipo === 'recordatorio') {
        this.agregarDescartado(n.id);
      }
    });
    this.notificaciones = [];
    this.guardarNotificaciones();
  }

  guardarNotificaciones() {
    localStorage.setItem('notificaciones', JSON.stringify(this.notificaciones));
  }

  get totalNoLeidas(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  getIcono(tipo: string): string {
    const iconos: { [key: string]: string } = {
      inscripcion: 'checkmark-circle-outline',
      cancelacion: 'close-circle-outline',
      recordatorio: 'alarm-outline',
      cupos: 'alert-circle-outline',
      nuevo: 'megaphone-outline'
    };
    return iconos[tipo] || 'notifications-outline';
  }

  getColor(tipo: string): string {
    const colores: { [key: string]: string } = {
      inscripcion: 'success',
      cancelacion: 'danger',
      recordatorio: 'primary',
      cupos: 'warning',
      nuevo: 'secondary'
    };
    return colores[tipo] || 'medium';
  }

  getTiempoRelativo(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMin / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMin < 1) return 'Ahora mismo';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    if (diffDias === 1) return 'Ayer';
    return `Hace ${diffDias} días`;
  }

  static agregarNotificacionGlobal(notif: Notificacion) {
    const guardadas = localStorage.getItem('notificaciones');
    const lista: Notificacion[] = guardadas ? JSON.parse(guardadas) : [];
    const yaExiste = lista.some(n => n.id === notif.id);
    if (!yaExiste) {
      lista.unshift(notif);
      localStorage.setItem('notificaciones', JSON.stringify(lista));
    }
  }
}