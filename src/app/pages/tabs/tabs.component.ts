import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  standalone: false
})
export class TabsComponent implements OnInit {

  notifNoLeidas: number = 0;

  ngOnInit() {
  this.actualizarBadge();
  // Refresca el badge cada 3 segundos automáticamente
  setInterval(() => {
    this.actualizarBadge();
  }, 3000);
}

  ionViewWillEnter() {
    this.actualizarBadge();
  }

  actualizarBadge() {
    const guardadas = localStorage.getItem('notificaciones');
    const lista = guardadas ? JSON.parse(guardadas) : [];
    this.notifNoLeidas = lista.filter((n: any) => !n.leida).length;
  }
}