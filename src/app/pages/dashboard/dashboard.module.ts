import { AppCommonModule } from '../../components/common/app-common.module';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import { MatCommonModule, MatCardModule, MatIconModule, MatListModule } from '@angular/material';
import { EntityModule } from '../common/entity/entity.module';

import {DashboardComponent} from './dashboard.component';
import {routing} from './dashboard.routing';
import { DashboardNoteEditComponent } from './dashboard-note-edit.component';

@NgModule({
  imports : [ CommonModule, FormsModule,  routing, 
  MatCommonModule, MatCardModule, MatIconModule, MatListModule, AppCommonModule , EntityModule],
  declarations : [
    DashboardComponent,
    DashboardNoteEditComponent
  ],
  providers : [
    
  ]
})
export class DashboardModule {
}
