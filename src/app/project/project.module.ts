import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProjectPageRoutingModule } from './project-routing.module';

import { ProjectPage } from './project.page';

import { NodeEditorComponent } from '../components/node-editor/node-editor.component';
import { QuillModule } from 'ngx-quill';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProjectPageRoutingModule,
    QuillModule.forRoot({
      format:'object'
    })
  ],
  declarations: [
    ProjectPage,
    NodeEditorComponent
  ]
})
export class ProjectPageModule {}
