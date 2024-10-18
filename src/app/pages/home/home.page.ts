import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, LoadingController } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class HomePage {
  loading!: HTMLIonLoadingElement;


  constructor(public authService: AuthService, private router: Router, private loadingCtrl: LoadingController) {
    this.loadingCtrl.create()
      .then(loading => {
        this.loading = loading;
      });
  }

  
  ingresarSeccion(seccion: string) {
    this.router.navigate([`/../cosas${seccion}`]);
  }


  cerrarSesion() {
    this.loading.present();

    this.authService.logout()
      .then(() => {
        this.router.navigate(['/login']);
      })
      .finally(() => {
        this.loading.dismiss();
      });
  }
}
