import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserCollectionComponent } from './user-collection';
import { UserCollectionDetailComponent } from './user-collection-detail';

const routes: Routes = [
  { path: '', component: UserCollectionComponent },
  { path: 'display/:id', component: UserCollectionDetailComponent },
  { path: 'create', component: UserCollectionDetailComponent },
  { path: 'edit/:id', component: UserCollectionDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserCollectionRoutingModule {}
