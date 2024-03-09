import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WeeklyCollectionComponent } from './weekly-collection/weekly-collection.component';
import { UsersDataComponent } from './users-data/users-data.component';
import { RedUsersComponent } from './red-users/red-users.component';
import { NavigationPageComponent } from './navigation-page/navigation-page.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    WeeklyCollectionComponent,
    UsersDataComponent,
    RedUsersComponent,
    NavigationPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
