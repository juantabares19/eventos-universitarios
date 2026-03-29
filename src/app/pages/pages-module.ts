import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing-module';
import { IonicModule } from '@ionic/angular';
import { EventosComponent } from './eventos/eventos.component';
import { EventDetailComponent } from './eventos/event-detail/event-detail.component';


@NgModule({
  declarations: [
    EventosComponent,
    EventDetailComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    IonicModule
  ]
})
export class PagesModule { }
