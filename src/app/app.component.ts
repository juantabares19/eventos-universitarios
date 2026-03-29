import { Component } from '@angular/core';
import { StorageService } from './services/storage.service'; // Importar el servicio de almacenamiento
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
// Componente raíz de la aplicación que se encarga de inicializar el servicio de almacenamiento
export class AppComponent implements OnInit {
  // Inyectar el servicio de almacenamiento para inicializarlo al iniciar la aplicación
  constructor(private storageService: StorageService) {}
  // Método que se ejecuta al iniciar el componente, se encarga de inicializar el servicio de almacenamiento
  async ngOnInit(): Promise<void> {
    await this.storageService.init();
  }
}
