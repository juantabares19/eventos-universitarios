import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { User, SessionUser } from '../interfaces/storage.interface';

@Injectable({
  providedIn: 'root'
})

// Servicio para manejar el almacenamiento local de usuarios y sesiones
export class StorageService {

  // Variable privada para almacenar la instancia de Storage
  private _storage: Storage | null = null;
 
  // Claves para almacenar usuarios y sesión en el almacenamiento local
  private readonly USERS_KEY = 'users';
  private readonly SESSION_KEY = 'session';
  
  // Inyecta el servicio de Storage en el constructor
  constructor(private storage: Storage) {}

   
  // Inicializa el almacenamiento local
  async init(): Promise<void> {
    this._storage = await this.storage.create();
  }

   // Asegura que el almacenamiento esté inicializado antes de usarlo
  private ensureReady(): Storage {
    if (!this._storage) {
      throw new Error('Storage no inicializado');
    }
    return this._storage;
  }

  //REGISTER
  // Obtiene la lista completa de usuarios desde el almacenamiento local
  async getUsers(): Promise<User[]> {
    const store = this.ensureReady();
    return (await store.get(this.USERS_KEY)) ?? [];
  }

  //REGISTER
  // Guarda la lista completa de usuarios en el almacenamiento local
  async saveUsers(users: User[]): Promise<void> {
    const store = this.ensureReady();
    await store.set(this.USERS_KEY, users);
  }


   //REGISTER
  // Agrega un nuevo usuario al almacenamiento local
  async addUser(user: User): Promise<void> {
    const users = await this.getUsers();
    users.push(user);
    await this.saveUsers(users);
  }

    //LOGIN
  // Busca un usuario por su correo electrónico
  async findUserByEmail(correo: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.correo.toLowerCase() === correo.toLowerCase()) ?? null;
  }
   
  //LOGIN
  // Guarda la sesión actual del usuario en el almacenamiento local
  async setSession(user: SessionUser): Promise<void> {
    const store = this.ensureReady();
    await store.set(this.SESSION_KEY, {
      isLoggedIn: true,
      user
    });
  }

  //ENTRA DIRECTO SI LA SESION EXISTE
  //Obtiene la sesión actual del usuario si existe, de lo contrario devuelve null
  async getSession(): Promise<{ isLoggedIn: boolean; user: SessionUser } | null> {
    const store = this.ensureReady();
    return await store.get(this.SESSION_KEY);
  }

  //PARA CERRAR SESION
  // Elimina la sesión actual del usuario del almacenamiento local
  async clearSession(): Promise<void> {
    const store = this.ensureReady();
    await store.remove(this.SESSION_KEY);
  }
}
