import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserCollectionRoutingModule } from './user-collection-routing.module';
import { UserCollectionComponent } from './user-collection/user-collection.component';
import { UserCollectionDetailComponent } from './user-collection-detail/user-collection-detail.component';


@NgModule({
  declarations: [
    UserCollectionComponent,
    UserCollectionDetailComponent
  ],
  imports: [
    CommonModule,
    UserCollectionRoutingModule
  ]
})
export class UserCollectionModule { }
