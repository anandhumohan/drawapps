import { Component, OnInit } from '@angular/core';

import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  projects: string[] = [];

  constructor(private alert: AlertController) { }

  ngOnInit() {
  }

  createDoc(){
    console.log('hi there');
    this.presentAlert();
  }

  createProjectWithName(name: string){
    this.projects.push(name);
  }

  async presentAlert() {
    const alert = await this.alert.create({
      cssClass: 'my-custom-class',
      header: 'Project Name',
      inputs: [
        {
          name: 'name1',
          type: 'text',
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          id: 'confirm-button',
          handler: (data) => {
            console.log(data);
            this.createProjectWithName(data.name1);
          }
        }
      ]
    });

    await alert.present();

  //  const { role } = await alert.onDidDismiss();
   // console.log('onDidDismiss resolved with role', role);
  }

}
