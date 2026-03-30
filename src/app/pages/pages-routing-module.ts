import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
import { EventosComponent } from './eventos/eventos.component';

import { CalendarComponent } from './calendar/calendar.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { EventDetailComponent } from './event-detail/event-detail.component';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsComponent,
    children: [
      { path: 'eventos', component: EventosComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'favorites', component: FavoritesComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: '', redirectTo: 'eventos', pathMatch: 'full' }
    ]
  },
  {
    path: 'event-detail/:id',
    component: EventDetailComponent
  },
  {
    path: '',
    redirectTo: 'tabs/eventos',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }