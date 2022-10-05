import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { HttpClientModule } from '@angular/common/http';
import { MediaCapture } from '@ionic-native/media-capture/ngx';
import { Media } from '@ionic-native/media/ngx';
import { File } from '@ionic-native/file/ngx';
import { QuillModule } from 'ngx-quill';
import { IonicStorageModule } from '@ionic/storage-angular';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { MultipleDocumentsPicker } from '@awesome-cordova-plugins/multiple-document-picker/ngx';

import { FilePath } from '@awesome-cordova-plugins/file-path/ngx';
import { Chooser } from '@awesome-cordova-plugins/chooser/ngx';
import { IonContent } from '@ionic/angular';

import { DocumentViewer } from '@awesome-cordova-plugins/document-viewer/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';





@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, BrowserAnimationsModule, HttpClientModule, IonicStorageModule.forRoot(), QuillModule.forRoot({
    format:'object'
  })],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, Camera, MediaCapture, Media, File, PhotoViewer, StreamingMedia, MultipleDocumentsPicker, FilePath, Chooser, IonContent, DocumentViewer, FileOpener, QuillModule],
  bootstrap: [AppComponent],
  exports:[QuillModule]
})
export class AppModule {}
