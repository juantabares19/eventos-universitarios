import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PagesRoutingModule } from './pages-routing-module';
import { IonicModule } from '@ionic/angular';
import { EventosComponent } from './eventos/eventos.component';
import { TabsComponent } from './tabs/tabs.component';
import { CalendarComponent } from './calendar/calendar.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { MyEventsComponent } from './my-events/my-events.component';
import { HeaderAppComponent } from '../components/header-app/header-app.component';
import { CerrarSesionComponent } from '../components/cerrar-sesion/cerrar-sesion.component';

@NgModule({
  declarations: [
    EventosComponent,
    EventDetailComponent,
    TabsComponent,
    CalendarComponent,
    FavoritesComponent,
    NotificationsComponent,
    MyEventsComponent,
    HeaderAppComponent,
    CerrarSesionComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    IonicModule
  ]
})
export class PagesModule { }