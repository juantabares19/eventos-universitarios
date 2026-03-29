import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  postRegister(userData: any) {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  postLogin(credentials: any) {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
}