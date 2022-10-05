import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { Node } from '../classes/node';
import { NodeEditorComponent } from '../components/node-editor/node-editor.component';
import { Storage } from '@ionic/storage';
import { Platform } from '@ionic/angular';
import { File, FileEntry } from '@ionic-native/file/ngx';

const MEDIA_FOLDER_NAME = 'my_media';
@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss']
})
export class ProjectPage implements OnInit {


  allNodes: Node[] = [];

  tempNode: Node;

  parentNode = new Node();
  childNodes: Node[] = [];
  grandParent: Node;

  project: string;

  constructor(private activatedRoute: ActivatedRoute, private alert: AlertController, private modal: ModalController, private storageService: Storage, private platform: Platform, private file: File) { }

  ngOnInit() {
    const projectId = this.activatedRoute.snapshot.paramMap.get('id');
    const params = this.activatedRoute.snapshot.queryParams;

    if(params.name && projectId !== null){ //eventually grab projectID from DB instead
      this.parentNode.value = params.name;
      this.parentNode.id = new Date().getTime(); // have to use something that won't repeat this will work

      this.allNodes.push(this.parentNode);
    }



  }

  createChild(name: string, position: number){
    var newChild = new Node();
    if(this.tempNode != null){
      newChild = this.tempNode;
      newChild.parentId = this.parentNode.id;
    }else{
    newChild.id = new Date().getTime();
    newChild.parentId = this.parentNode.id;
    newChild.value = name;
    }

    //var imageElement = document.getElementById("imageElement") as HTMLImageElement;
    //imageElement.src = passedNode.;

    //this.newItem.imageUrl = '';
/*
    this.addItem(this.newItem).then(item => {
      this.newItem = <Item>{};
    });*/

    

    this.allNodes.push(newChild);

    this.addChildToParentAtPosition(this.parentNode.id, newChild.id, position);
    this.childNodes.splice(position+1, 0, newChild);

  }
/*
  async addItem(item: Item) : Promise<any>{
    const ITEM_KEY = 'val';
    if (item) {
      return this.storageService.set(ITEM_KEY, item);
    } else {
      return this.storageService.set(ITEM_KEY, item);
    }

  }
*/
  addChildToParentAtPosition(parentid: number, childId: number, childPos: number){
    this.allNodes.forEach(node => {
      if (node.id === parentid){
        node.childrenIds.splice(childPos+1, 0, childId);
      }
    });

  }

  moveToNode(nodeid: number){
    let childArray: number[];
    const newChildren: Node[] = [];

    this.allNodes.forEach(node =>{
      if (node.id === nodeid) {
        this.setGrandparent(node.parentId);
        this.parentNode = node;
        childArray = node.childrenIds;
      }
    });

    if (childArray) {
      childArray.forEach(child => {
        this.allNodes.forEach(node => {
          if (node.id === child){
            newChildren.push(node);
            return false;
          }
        });
      });

      this.childNodes = newChildren;
    } else {
      this.childNodes = [];
    }


  }

  setGrandparent(nodeid: number){
    this.grandParent = null;
    this.allNodes.forEach(node => {
      if (node.id === nodeid) {
        this.grandParent = node;
      }
    });
  }

  async openEditor(nodeNumber: number, newNode: boolean, isChild: boolean){

    let passedNode: Node;

    if (newNode) {
      passedNode = new Node();
    } else {
      if (isChild){
        passedNode = this.childNodes[nodeNumber];
      } else {
        passedNode = this.parentNode;
      }

    }

    const editorModal = await this.modal.create({
      component: NodeEditorComponent,
      backdropDismiss: false,
      componentProps: {
        node: passedNode
       }
    });

    
    //alert("image");
    
    //var imageElement = document.getElementById("ionId") as HTMLImageElement;
    //imageElement.innerHTML= "<ion-icon name='image' slot='start' ></ion-icon>";
    //imageElement.src = passedNode.imageurl;
    await editorModal.present();
    if(passedNode.imageurl != null){
      //this.loadFiles(passedNode.value,passedNode.imageurl);
      //alert("image");
      //let emp = new NodeEditorComponent(null,null,null,null,this.file,this.platform,null,null,null,null,null,null);
      //const ext = passedNode.imageurl.split('.').pop();
      //await emp.loadFiles(passedNode.id,passedNode.imageurl, ext, false);
      //await editorModal.present();
      //this.
      //var imageElement = document.getElementById("imageElement") as HTMLImageElement;
      //imageElement.src = passedNode.imageurl;
     // this.
    }
    

    const { data } = await editorModal.onDidDismiss();

    if (data.saveData) {
      if(isChild){
        if(newNode){
          this.tempNode = data.node;
          this.createChild(data.node.value,nodeNumber);
        } else {
          this.childNodes[nodeNumber]= data.node;
        }
      } else {
        this.parentNode = data.node;

      }

    }


  }



  getLeft(index){
    return Math.cos((2*index*Math.PI)/(this.childNodes.length))*120+13;
  }

  getTop(index){
    return Math.sin((2*index*Math.PI)/(this.childNodes.length))*120+11;
  }

  getLeftAdd(index){
    return Math.cos((2*Math.PI*index+Math.PI)/(this.childNodes.length))*50+40;
  }

  getTopAdd(index){
    return Math.sin((2*Math.PI*index+Math.PI)/(this.childNodes.length))*50+40;
  }


  async presentAlert(position: number) {
    const alert = await this.alert.create({
      cssClass: 'my-custom-class',
      header: 'Title',
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
            this.createChild(data.name1, position);
          }
        }
      ]
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  async loadFiles(newName,newPath) {
    await this.file.listDir(this.file.dataDirectory, MEDIA_FOLDER_NAME).then(
      res => {
        //console.log(res);
        
        for (var i = 0; i < res.length; i++) {
          //console.log(newPath);
          //console.log(res[i].nativeURL);
          const check = `${newName}.${'jpg'}`;
          if(res[i].name === check){
            //console.log(res);
           // this.files = []
            //console.log(this.files);
           // this.files[0] = res[i];
            newPath =res[i].nativeURL; 
            console.log("inside the login");
           // console.log(this.files);
          }
        }
      },
      err => console.log('error loading files: ', err)
    );
    }
  



}
