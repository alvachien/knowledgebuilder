import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SentencesListComponent } from './sentences-list';
import { SentencesDetailComponent } from './sentences-detail';

const routes: Routes = [
  {
    path: 'sentences',
    component: SentencesListComponent,
  },
  {
    path: 'disp-sentence/:folder/:file',
    component: SentencesDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnglishLearningRoutingModule {}
