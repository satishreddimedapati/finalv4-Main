import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation-page',
  templateUrl: './navigation-page.component.html',
  styleUrls: ['./navigation-page.component.css']
})
export class NavigationPageComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  navigateToWeeklyCollection() {
    this.router.navigate(['/weekly-collection']);
  }

  navigateToUsersData() {
    this.router.navigate(['/users-data']);
  }

  navigateToRedUsers() {
    this.router.navigate(['/red-users']);
  }

}
