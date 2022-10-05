import { Component, Input, OnInit, Output, EventEmitter, ViewChild, NgModule } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Node } from 'src/app/classes/node';
import { Platform } from '@ionic/angular';
import { IonContent } from '@ionic/angular';

import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
//import { Camera, CameraResultType, ImageOptions } from '@capacitor/camera';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions, CaptureVideoOptions, CaptureAudioOptions } from '@ionic-native/media-capture/ngx';
//import { Media, MediaObject } from '@awesome-cordova-plugins/media/ngx';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Storage } from '@ionic/storage';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { File, FileEntry, IWriteOptions } from '@ionic-native/file/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { MultipleDocumentsPicker } from '@awesome-cordova-plugins/multiple-document-picker/ngx';
import { FilePath } from '@awesome-cordova-plugins/file-path/ngx';
import { Chooser, ChooserResult } from '@awesome-cordova-plugins/chooser/ngx';
//import { FileChooser } from '@ionic-native/file-chooser';
import { DocumentViewerOptions } from '@awesome-cordova-plugins/document-viewer/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
//import { QuillModule } from 'ngx-quill/lib/quill.module';
//import { QuillModule } from 'ngx-quill';
//import { QuillModule } from 'ngx-quill';
import { QuillModule } from 'ngx-quill';
import { pdfExporter } from 'quill-to-pdf';
/*
declare global {
  var files=[];
}
*/

export interface Item {
  id: number;
  projectId: string; //the project this node belongs to
  parentId: number; // id of the parent node if it has one
  type: string; //eg text, image, video etc
  value: string; //holds data of type
  imageUrl: string;
  fileUrl: string;
}
const MEDIA_FILES_KEY = 'mediaFiles';

const MEDIA_FOLDER_NAME = 'my_media';
@Component({
  selector: 'app-node-editor',
  templateUrl: './node-editor.component.html',
  styleUrls: ['./node-editor.component.scss'],
})



export class NodeEditorComponent implements OnInit {

  @ViewChild('imageCanvas', { static: false }) canvas: any;
  canvasElement: any;
  saveX: number;
  saveY: number;

  selectedColor = '#9e2956';
  colors = [ '#9e2956', '#c2281d', '#de722f', '#edbf4c', '#5db37e', '#459cde', '#4250ad', '#802fa3' ];

  drawing = false;
  lineWidth = 5;
  documents: ChooserResult;
  mytext = null;
  
  files =  [];

  mediaFiles = [];
  @ViewChild('myvideo') myVideo: any;
  audio:any;
  keys:string[]=[];

  newItem: Item = <Item>{};

  @Input() node: Node;
  @Output() nodeChange = new EventEmitter<Node>();
  private fileName: string;
  //content: any;
  constructor(private modal: ModalController, private mediaCapture: MediaCapture, private storage: Storage, private media: Media, private file: File, private platform:Platform, private photoViewer:PhotoViewer, private streamingMedia: StreamingMedia, private camera: Camera, private multipleDocumentsPicker:MultipleDocumentsPicker, private filePath:FilePath, private chooser:Chooser, private fileOpener:FileOpener, private quillModule:QuillModule) {
    
    this.platform.ready().then(() => {
      if (!this.platform.is('cordova')) {
        return false;
      }

      if (this.platform.is('ios')) {
        this.fileName = file.documentsDirectory.replace(/file:\/\//g, '') + 'record.m4a';
      }
      else if (this.platform.is('android')) {
        this.fileName = file.externalDataDirectory.replace(/file:\/\//g, '') + 'record.3gp';
      }
      else {
        // future usage for more platform support
        return false;
      }
    });
   }
   

 

  async ngOnInit() {
    await this.storage.create();
    let path = this.file.dataDirectory;
    
    this.platform.ready().then(() => {
      this.file.checkDir(path, MEDIA_FOLDER_NAME).then(()=>{
        //this.loadFiles();
        console.log("file exist");
      }, err => {
        this.file.createDir(path, MEDIA_FOLDER_NAME,true).then(()=>{
          //this.loadFiles();
          console.log("file created");
        })
      });
    })
    //alert("hai");
  }

  

  dismiss(save: boolean) {
    console.log(this.node.value);
    this.modal.dismiss({
      saveData: save,
      node: this.node,
    });
  }

  tempImage;
/*
  ngAfterViewInit() {
    // Set the Canvas Element and its size
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.platform.width() + '';
    this.canvasElement.height = 200;
  }*/

  async takePhoto(){
    //alert("hai");
   /* const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri
    });*
    var imageUrl = image.webPath;
    //alert(JSON.stringify(image));

  // Can be set to the src of an image now
  var imageElement = document.getElementById("imageElement") as HTMLImageElement;
  imageElement.src = imageUrl;

  this.tempImage = image;

*/
    
  }

  async saveImage(){
    await this.savePicture(this.tempImage);
  }  

  private async savePicture(tempImage) {
    // Convert photo to base64 format, required by Filesystem API to save
   const base64Data = await this.readAsBase64(tempImage);
  
    // Write the file to the data directory
    this.newItem.id = new Date().getTime();
    const fileName = this.newItem.id + '.jpeg';

    this.newItem.type = 'image';
    this.newItem.value = fileName;
    this.newItem.imageUrl = tempImage.webPath;
    this.node.id = this.newItem.id;
    this.node.imageurl = this.newItem.imageUrl;
    this.node.type = 'image';

    this.addItem(this.newItem).then(item => {
      this.newItem = <Item>{};
    });
    
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });
    
    this.dismiss(true);
    // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
   /* return {
      filepath: fileName,
      webviewPath: photo.webPath
    };*/
  }

  async addItem(item: Item) : Promise<any>{
    const ITEM_KEY = 'val';
    if (item) {
      return this.storage.set(ITEM_KEY, item);
    } else {
      return this.storage.set(ITEM_KEY, item);
    }

  }
  
  private async readAsBase64(photo: any) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
  
    return await this.convertBlobToBase64(blob) as string;
  }
  
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });




 /* ionViewDidLoad() {
    this.storage.get(MEDIA_FILES_KEY).then(res => {
      this.mediaFiles = JSON.parse(res) || [];
    })
  }*/

 
async recordAudio() {
   await this.mediaCapture.captureAudio().then(res => {
     // this.storeMediaFiles(res);
    }, (err: CaptureError) => console.error(err));
  
  }
 
  captureVideo() {
    let options: CaptureVideoOptions = {
      limit: 1,
      duration: 30
    }
    this.mediaCapture.captureVideo(options).then((res: MediaFile[]) => {
      let capturedFile = res[0];
      let fileName = capturedFile.name;
      let dir = capturedFile['localURL'].split('/');
      dir.pop();
      let fromDirectory = dir.join('/');      
      var toDirectory = this.file.dataDirectory;
      
      this.file.copyFile(fromDirectory , fileName , toDirectory , fileName).then((res) => {
        this.storeMediaFiles([{name: fileName, size: capturedFile.size}]);
      },err => {
        console.log('err: ', err);
      });
          },
    (err: CaptureError) => console.error(err));
  }
  play(myFile) {
    if (myFile.name.indexOf('.wav') > -1) {
      const audioFile: MediaObject = this.media.create(myFile.localURL);
      audioFile.play();
    } else {
      let path = this.file.dataDirectory + myFile.name;
      let url = path.replace(/^file:\/\//, '');
      let video = this.myVideo.nativeElement;
      video.src = url;
      video.play();
    }
  }

 
  async storeMediaFiles(files) {
   await  this.storage.get(MEDIA_FILES_KEY).then(res => {
      if (res) {
        let arr = JSON.parse(res);
        arr = arr.concat(files);
        this.storage.set(MEDIA_FILES_KEY, JSON.stringify(arr));
      } else {
        this.storage.set(MEDIA_FILES_KEY, JSON.stringify(files))
      }
      this.mediaFiles = this.mediaFiles.concat(files);
    })
  }

  

  

  
  async saveFile(event) {
    //const filedate = (document.querySelector("input[type=file]") as HTMLInputElement).value;
    // Create a FileWriter object for our FileEntry (log.txt).

    //this.newItem.id = new Date().getTime();
    //const fileName = this.newItem.id + '.pdf';

   // this.newItem.type = 'file';
    //this.newItem.value = fileName;
   // this.newItem.fileUrl = filedate;
    //this.node.id = this.newItem.id;
    //this.node.fileUrl = this.newItem.fileUrl;
    //this.node.type = 'file';
/*
    this.addItem(this.newItem).then(item => {
      this.newItem = <Item>{};
    });
    const base64Data = await this.readAsBase64(filedate);
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });*/
   // alert(savedFile.uri);

    this.dismiss(true);
  }

  captureImage(){
    this.clearAll();
    document.getElementById("imgCapture").style.display = "";
    document.getElementById("mainButtonId").style.display = "";
  }
  captureSound(){
    this.clearAll();
    document.getElementById("sodCapture").style.display = "";
    document.getElementById("mainButtonId").style.display = "";
  }
  captureFilm(){
    this.clearAll();
    document.getElementById("vedCapture").style.display = "";
    document.getElementById("mainButtonId").style.display = "";
  }
  pickImage(){
    this.clearAll();
    document.getElementById("pickImageId").style.display = "";
    document.getElementById("mainButtonId").style.display = "";
  }
  getFile(){
    this.clearAll();
    document.getElementById("pickFileId").style.display = "";
  }
  getCanvas(){
    this.clearAll();
    document.getElementById("pickCanvasId").style.display = "";
  }
  getEditor(){
    this.clearAll();
    //document.getElementById("mainButtonId").style.display = "none";
    document.getElementById("pickEditorId").style.display = "";
  }

  clearAll(){
    document.getElementById("pickImageId").style.display = "none";
    document.getElementById("imgCapture").style.display = "none";
    document.getElementById("sodCapture").style.display = "none";
    document.getElementById("vedCapture").style.display = "none";
    document.getElementById("pickCanvasId").style.display = "none";
    document.getElementById("pickFileId").style.display = "none";
    document.getElementById("pickEditorId").style.display = "none";
    document.getElementById("mainButtonId").style.display = "none";
  }

  async captureImageNow(){
    var newPath;
    const newName = new Date().getTime();
    await this.mediaCapture.captureImage().then((data: MediaFile[])=>{
      if(data.length > 0){
        this.copyFileToLocalDir(data[0].fullPath, newName)
      }
      });

      //create node

      //this.newItem.id = new Date().getTime();
      //const fileName = this.newItem.id + '.pdf';

      //this.newItem.type = 'file';
      //this.newItem.value = fileName;
      //this.newItem.fileUrl = filedate;
     // this.node.id = newName;
     // this.node.imageurl = newPath;
     // this.node.type = 'camera_image';
      //var imageElement = document.getElementById("imageElement") as HTMLImageElement;
      //imageElement.src = newPath;
      //this.loadFiles(newName, newPath);
      //this.modal.
      //window.location.reload();
      //this.dismiss(true);
  }
  async captureSoundNow(){
    const newName = new Date().getTime();
    await this.mediaCapture.captureAudio().then((data: MediaFile[])=>{
      if(data.length > 0){
        this.copyFileToLocalDir(data[0].fullPath, newName)
      }
      });
  }
  captureFilmNow(){
    const newName = new Date().getTime();
    this.mediaCapture.captureVideo().then((data: MediaFile[])=>{
      if(data.length > 0){
        this.copyFileToLocalDir(data[0].fullPath, newName)
      }
      });
  }

  pickImagesNow() {
    const options: CameraOptions = {
      quality: 100,
      sourceType:this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    this.camera.getPicture(options).then((imageData) => {
      console.log(imageData);
     // imageData is either a base64 encoded string or a file URI
     // If it's base64 (DATA_URL):
     const newName = new Date().getTime();
     if(imageData.length > 0){
      this.copyFileToLocalDir(imageData, newName)
    }
     let base64Image = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
     // Handle error
    });
  }
  getFileNow(){

    this.chooser.getFile().then((fileuri)=>{
      console.log(fileuri);
      this.documents = fileuri;
      const newName = new Date().getTime();
     // this.filePath.resolveNativePath(fileuri.uri).then((nativepath)=>{
       // this.storeData(fileuri.dataURI,newName);
     // })

    })
    //console.log($event);
    /*
    const newName = new Date().getTime();
    let path = (<HTMLInputElement>document.getElementById("pickFileId")).files[0].name;
    if(path.length > 0){
      this.copyFileToLocalDir(path, newName)
    }

this.multipleDocumentsPicker.pick(2).then((res) => {
  console.log(res);
  const newName = new Date().getTime();
  if(res.length > 0){
    this.copyFileToLocalDir(res, newName)
  }

});*/
  }

  async storeData(path, newname){
    console.log(path);
    let myPath = path;
  //  if(path.indexOf('file://') < 0){
  //    myPath = 'file://' + path;
  //    console.log("hai");
  //  }
    const ext = myPath.split('.').pop();
    const d = Date.now();
    const newName = `${newname}.${'pdf'}`;
    console.log(ext);
    //console.log(d);
    console.log(newName);

    //const name = myPath.substr(myPath.lastIndexOf('/') + 1);
    //const copyForm = myPath.substr(0, myPath.lastIndexOf('/') + 1);
    var blob = new Blob([newname], { type: 'application/pdf' });
    const copyTo = this.file.externalRootDirectory + MEDIA_FOLDER_NAME;
    console.log(name);
    //console.log(copyForm);
    console.log(copyTo);
    const newpath = copyTo +'/'+newName;
   /* await this.file.writeFile(copyTo,newpath,path,{append: true}).then(() =>{
      console.log(copyTo);
    },err => console.log('error:',err));
    this.loadFiles(newname,copyTo,ext);*/
   // var imageElement = document.getElementById("imageElement") as HTMLImageElement;
   // console.log(copyTo+'/'+newName);
   // imageElement.src = copyTo+'/'+newName;
  }


  async copyFileToLocalDir(path, newname){
    console.log(path);
    let myPath = path;
    if(path.indexOf('file://') < 0){
      myPath = 'file://' + path;
      console.log("hai");
    }
    const ext = myPath.split('.').pop();
    const d = Date.now();
    const newName = `${newname}.${ext}`;
    console.log(ext);
    //console.log(d);
    console.log(newName);

    const name = myPath.substr(myPath.lastIndexOf('/') + 1);
    const copyForm = myPath.substr(0, myPath.lastIndexOf('/') + 1);
    const copyTo = this.file.dataDirectory + MEDIA_FOLDER_NAME;
    console.log(name);
    console.log(copyForm);
    console.log(copyTo);
    await this.file.copyFile(copyForm,name,copyTo,newName).then(() =>{
      console.log(copyTo);
    },err => console.log('error:',err));
    this.loadFiles(newname,copyTo,ext,true);
   // var imageElement = document.getElementById("imageElement") as HTMLImageElement;
   // console.log(copyTo+'/'+newName);
   // imageElement.src = copyTo+'/'+newName;
  }

  openFile(f: FileEntry){
    if(f.name.indexOf('.jpg')> -1 || f.name.indexOf('.webp')> -1 || f.name.indexOf('.png')> -1){
      this.photoViewer.show(f.nativeURL,"image");
    }else if (f.name.indexOf('.MOV') > -1 || f.name.indexOf('.mp4') > -1) {
      // E.g: Use the Streaming Media plugin to play a video
      this.streamingMedia.playVideo(f.nativeURL);
    }else if (f.name.indexOf('.pdf')) {
      const options: DocumentViewerOptions = {
        title: 'documents',
        openWith: { enabled: true }
      }
      // E.g: Use the Streaming Media plugin to play a video
      //this.documentViewer.viewDocument(f.nativeURL, 'application/pdf',options);
      this.fileOpener.open(f.nativeURL, 'application/pdf');
    }
  }

  async loadFiles(newName,newPath,ext,status) {
    await this.file.listDir(this.file.dataDirectory, MEDIA_FOLDER_NAME).then(
      res => {
        //console.log(res);
        
        for (var i = 0; i < res.length; i++) {
          //console.log(newPath);
          //console.log(res[i].nativeURL);
          const check = `${newName}.${ext}`;
          if(res[i].name === check){
            //console.log(res);
            this.files = []
            //console.log(this.files);
            this.files[0] = res[i];
           this.node.files[0] = this.files[0];
            newPath =res[i].nativeURL; 
            console.log("inside the login");
            console.log(this.node.files);
            console.log(this.node.files[0]);
            console.log(this.files);
            console.log(this.files[0]);
          }
        }
      },
      err => console.log('error loading files: ', err)
    );
    if(status){
    this.node.id = newName;
    this.node.imageurl = newPath;
    this.node.type = 'camera_image';
    }
  }
  
/*
  selectColor(color) {
    this.selectedColor = color;
  }*/
  /*
  startDrawing(ev) {
    var canvasPosition = this.canvasElement.getBoundingClientRect();
  
    this.saveX = ev.touches[0].pageX - canvasPosition.x;
    this.saveY = ev.touches[0].pageY - canvasPosition.y;
  }
  *//*
  moved(ev) {
    var canvasPosition = this.canvasElement.getBoundingClientRect();
  
    let ctx = this.canvasElement.getContext('2d');
    let currentX = ev.touches[0].pageX - canvasPosition.x;
    let currentY = ev.touches[0].pageY - canvasPosition.y;
  
    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.selectedColor;
    ctx.lineWidth = 5;
  
    ctx.beginPath();
    ctx.moveTo(this.saveX, this.saveY);
    ctx.lineTo(currentX, currentY);
    ctx.closePath();
  
    ctx.stroke();
  
    this.saveX = currentX;
    this.saveY = currentY;
  }*/
  /*
  
  saveCanvasImage() {
    var dataUrl = this.canvasElement.toDataURL();
  
    let ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clears the canvas
  
    let name = new Date().getTime() + '.webp';
    let path = this.file.dataDirectory;
    let options: IWriteOptions = { replace: true };
  
    var data = dataUrl.split(',')[1];
    let blob = this.b64toBlob(data, 'image.webp');
  
    this.file.writeFile(path, name, blob, options).then(res => {
      this.storeImage(name);
    }, err => {
      console.log('error: ', err);
    });
  }
  */
  // https://forum.ionicframework.com/t/save-base64-encoded-image-to-specific-filepath/96180/3
 

  ngAfterViewInit() {
    // Set the Canvas Element and its size
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.platform.width() + '';
    this.canvasElement.height = 200;
  }

  startDrawing(ev) {
    this.drawing = true;
    var canvasPosition = this.canvasElement.getBoundingClientRect();

    this.saveX = ev.touches[0].pageX - canvasPosition.x;
    this.saveY = ev.touches[0].pageY - canvasPosition.y;
  }

  endDrawing() {
    this.drawing = false;
  }

  selectColor(color) {
    this.selectedColor = color;
  }

  setBackground() {
    var background = new Image();
    background.src = './assets/code.webp';
    let ctx = this.canvasElement.getContext('2d');

    background.onload = () => {
      ctx.drawImage(background,0,0, this.canvasElement.width, this.canvasElement.height);
    }
  }

  moved(ev) {
    if (!this.drawing) return;
  
    var canvasPosition = this.canvasElement.getBoundingClientRect();
    let ctx = this.canvasElement.getContext('2d');
  
    let currentX = ev.touches[0].pageX - canvasPosition.x;
    let currentY = ev.touches[0].pageY - canvasPosition.y;
  
    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.selectedColor;
    ctx.lineWidth = this.lineWidth;
  
    ctx.beginPath();
    ctx.moveTo(this.saveX, this.saveY);
    ctx.lineTo(currentX, currentY);
    ctx.closePath();
  
    ctx.stroke();
  
    this.saveX = currentX;
    this.saveY = currentY;
  }

  saveCanvasImage() {
    var dataUrl = this.canvasElement.toDataURL("image/png");
  
    let ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clears the canvas
    
    let name = new Date().getTime();
    let newName = name + '.png';

    let path = this.file.dataDirectory + MEDIA_FOLDER_NAME;
    let options: IWriteOptions = { replace: true };
  
    var data = dataUrl.split(',')[1];
    let blob = this.b64toBlob(data, 'image.png');
  
    this.file.writeFile(path, newName, blob, options).then(res => {
      const newName = new Date().getTime();
      this.loadFiles(name,path,'png',true);
    // if(name.length > 0){
      //this.copyFileToLocalDir(imageData, newName)
   // }
      //this.storeImage(name);
    }, err => {
      console.log('error: ', err);
    });
    this.dismiss(true);
  }
  
  // https://forum.ionicframework.com/t/save-base64-encoded-image-to-specific-filepath/96180/3
  b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];
  
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);
  
      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      var byteArray = new Uint8Array(byteNumbers);
  
      byteArrays.push(byteArray);
    }
  
    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
  saveFiles(){
    var dataUrl = this.documents.dataURI;
  
    
    let name = new Date().getTime();
    let newName = name + '.pdf';

    let path = this.file.dataDirectory + MEDIA_FOLDER_NAME;
    let options: IWriteOptions = { replace: true };
  
    var data = dataUrl.split(',')[1];
    let blob = this.b64toBlob(data, 'application.pdf');
  
    this.file.writeFile(path, newName, blob, options).then(res => {
      //const newName = new Date().getTime();
      this.loadFiles(name,path,'pdf',true);
    // if(name.length > 0){
      //this.copyFileToLocalDir(imageData, newName)
   // }
      //this.storeImage(name);
    }, err => {
      console.log('error: ', err);
    });
    this.dismiss(true);
  }
  async saveEditorImage(){
    console.log(this.mytext);
    const pdfAsBlob = await pdfExporter.generatePdf(this.mytext);
    let options: IWriteOptions = { replace: true };
    let path = this.file.dataDirectory + MEDIA_FOLDER_NAME;
    let name = new Date().getTime();
    let newName = name + '.pdf';
    this.file.writeFile(path, newName, pdfAsBlob, options).then(res => {
      //const newName = new Date().getTime();
      this.loadFiles(name,path,'pdf',true);
    // if(name.length > 0){
      //this.copyFileToLocalDir(imageData, newName)
   // }
      //this.storeImage(name);
    }, err => {
      console.log('error: ', err);
    });
    this.dismiss(true);
    console.log(pdfAsBlob);
  }

}
