// app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavigationPageComponent } from './navigation-page/navigation-page.component';
import { WeeklyCollectionComponent } from './weekly-collection/weekly-collection.component';
import { UsersDataComponent } from './users-data/users-data.component';
import { RedUsersComponent } from './red-users/red-users.component';

const routes: Routes = [
  { path: '', redirectTo: '/navigation', pathMatch: 'full' },
  { path: 'navigation', component: NavigationPageComponent },
  { path: 'weekly-collection', component: WeeklyCollectionComponent },
  { path: 'users-data', component: UsersDataComponent },
  { path: 'red-users', component: RedUsersComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
