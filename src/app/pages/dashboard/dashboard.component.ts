import { Component, OnInit } from '@angular/core';
import { NewsData } from 'src/app/interfaces/dash.interface';
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent  implements OnInit {

  //Atributos de la clase
  allNews: Array<NewsData> = [];

  constructor(
    private dashboardService: DashboardService
  ) { }

  ngOnInit() {
    this.getAllNews();
  }

  //Metodo para obtener noticias
  getAllNews(){
    this.dashboardService.getAllNewsService().subscribe({
      next: (response: any) => {
        if (response.articles.length == 0) {
          console.log('No se encontraron noticias');
          return;
        }
        this.allNews = response.articles;
        console.log('Noticias obtenidas:', this.allNews);
        

      },
      error: (error: any) => {
        console.error('Error al obtener las noticias:', error);
      }   
    })
    
  }

  //Navegacion a detalle de noticia
  navDetailNews(url: string) {
    window.open(url, '_system');    
  }
}


