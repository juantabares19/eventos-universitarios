import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  APIKEYNEWS = environment.apiKeyNews;

  constructor(
    private http: HttpClient  
  ) { }

  //Metodo de servcio para obtener datos noticias
  getAllNewsService() {
    return this.http.get(`${environment.urlNews}?q=tesla&from=2026-02-28&sortBy=publishedAt&apiKey=${this.APIKEYNEWS}`);
  }
  
  
}
