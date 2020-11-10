import { Component, OnInit } from '@angular/core';
import { AuthService } from "angularx-social-login";
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-salita',
  templateUrl: './salita.component.html',
  styleUrls: ['./salita.component.scss']
})
export class SalitaComponent implements OnInit {
  
  constructor(private _sAuthService:AuthService,
              private _sWebsocket:WebsocketService) { }

  public barChartOptions = {
    scaleShowVerticalLines: true,
    responsive: true
  };
  
  public barChartLabels = ['Mensajes'];
  public barChartType = 'bar';
  public barChartLegend = true;
  public barChartData = [
    {data: [0], label: 'Mensajes Totales'},
    
  ];

  

  ngOnInit() {
    this._sWebsocket.contadorMensajes().subscribe((contador:any)=>{
      
      console.log(contador);
      this.barChartData = [
        {data: [contador], label: 'Mensajes Totales'},
        
      ];
    })
  }

  cerrarSesion(){
    this._sAuthService.signOut().then(()=>{
      this._sWebsocket.logout();
    }).catch(()=>{
      this._sWebsocket.logout();
    });
  }

}
