import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventosComponent } from './eventos/eventos.component';
import { EventDetailComponent } from './event-detail/event-detail.component';


const routes: Routes = [
  {
    path: 'eventos',
    component: EventosComponent
  },
  {
    path: 'event-detail/:id',
    component: EventDetailComponent
  },
  {
    path: '',
    redirectTo: 'eventos',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
