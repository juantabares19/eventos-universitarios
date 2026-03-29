// Archivo de interfaces para definir la estructura de los datos relacionados con el almacenamiento de usuarios y sesiones

// Interfaz que representa un usuario registrado en la aplicación
export interface User {
  id: string;
  nombre: string;
  correo: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

// Interfaz que representa la información de la sesión del usuario actualmente autenticado
export interface SessionUser {
  id: string;
  nombre: string;
  correo: string;
}
