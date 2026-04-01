import { Component } from '@angular/core';
import { StorageService } from './services/storage.service'; // Importar el servicio de almacenamiento
import { OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
// Componente raíz de la aplicación que se encarga de inicializar el servicio de almacenamiento
export class AppComponent implements OnInit {
  // Inyectar el servicio de almacenamiento para inicializarlo al iniciar la aplicación
  constructor(
    private storageService: StorageService,
    private platform: Platform
    
  ) {
    // Configurar el StatusBar al iniciar la aplicación
    this.platform.ready().then(() => { this.configureStatusBar(); });
  }

  //Agregar statusbar
  async configureStatusBar() {
    if (!Capacitor.isNativePlatform()) return;
  
    // Configurar el StatusBar para que tenga un estilo oscuro, no se superponga a la vista web  y tenga un fondo
    try {
      await StatusBar.setStyle({ style: Style.Dark }); 
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: '#000000' });
    } catch (error) {
      console.error('Error al configurar el StatusBar:', error);
    }
    
  }
  // Método que se ejecuta al iniciar el componente, se encarga de inicializar el servicio de almacenamiento
  async ngOnInit(): Promise<void> {
    await this.storageService.init();
  }
}
