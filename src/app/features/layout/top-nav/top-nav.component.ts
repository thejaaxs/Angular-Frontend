import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../shared/models/auth.model';

interface NavItem {
  label: string;
  path: string;
}

@Component({
  standalone: true,
  selector: 'app-top-nav',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  template: `
    <header class="mm-topnav">
      <div class="mm-topnav-inner">
        <button type="button" class="menu-toggle" (click)="toggleMobileNav($event)" aria-label="Toggle navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <a class="brand" routerLink="/home" (click)="closeAllMenus()">
          <span class="brand-mark">MM</span>
          <span class="brand-text">
            <strong>MotoMint</strong>
            <small>Two-wheeler marketplace</small>
          </span>
        </a>

        <form class="top-search desktop-search" (ngSubmit)="onSearch()">
          <input type="search" [(ngModel)]="searchTerm" name="searchTerm" placeholder="Search bikes, scooters, brands..." />
          <button type="submit" class="btn btn-ghost">Search</button>
        </form>

        <nav class="nav-links desktop-nav" *ngIf="navLinks.length">
          <a *ngFor="let link of navLinks" [routerLink]="link.path" routerLinkActive="active">{{ link.label }}</a>
        </nav>

        <div class="account-wrap" *ngIf="isAuthenticated; else guestActions">
          <button type="button" class="profile-btn" (click)="toggleProfile($event)">
            <span class="profile-meta">
              <span class="profile-email" [title]="email || ''">{{ email || 'user' }}</span>
              <span class="role-badge">{{ roleLabel }}</span>
            </span>
            <span class="caret" [class.open]="profileOpen"></span>
          </button>

          <div class="profile-menu" *ngIf="profileOpen">
            <button type="button" class="btn btn-ghost" (click)="goHome()">Home</button>
            <button type="button" class="btn btn-danger" (click)="logout()">Logout</button>
          </div>
        </div>

        <ng-template #guestActions>
          <div class="guest-actions">
            <a routerLink="/login"><button type="button" class="btn btn-ghost">Login</button></a>
            <a routerLink="/register"><button type="button" class="btn btn-accent">Register</button></a>
          </div>
        </ng-template>
      </div>

      <div class="mobile-drawer" *ngIf="mobileNavOpen">
        <form class="top-search mobile-search" (ngSubmit)="onSearch()">
          <input type="search" [(ngModel)]="searchTerm" name="mobileSearchTerm" placeholder="Search bikes, scooters, brands..." />
          <button type="submit" class="btn btn-ghost">Search</button>
        </form>
        <nav class="nav-links mobile-nav" *ngIf="navLinks.length">
          <a *ngFor="let link of navLinks" [routerLink]="link.path" routerLinkActive="active" (click)="closeAllMenus()">
            {{ link.label }}
          </a>
        </nav>
        <div class="mobile-actions" *ngIf="!isAuthenticated">
          <a routerLink="/login"><button type="button" class="btn btn-ghost" (click)="closeAllMenus()">Login</button></a>
          <a routerLink="/register"><button type="button" class="btn btn-accent" (click)="closeAllMenus()">Register</button></a>
        </div>
      </div>
    </header>
  `,
  styleUrl: './top-nav.component.css'
})
export class TopNavComponent {
  @Input() publicMode = false;

  role: UserRole | null;
  email: string | null;
  navLinks: NavItem[] = [];
  profileOpen = false;
  mobileNavOpen = false;
  searchTerm = '';

  constructor(private auth: AuthService, private router: Router) {
    this.role = this.auth.getRole();
    this.email = this.auth.getEmail();
    this.navLinks = this.buildNavLinks(this.role);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.closeAllMenus());
  }

  get isAuthenticated(): boolean {
    if (this.publicMode) return false;
    return !!this.role;
  }

  get roleLabel(): string {
    return (this.role || 'ROLE_GUEST').replace('ROLE_', '');
  }

  onSearch() {
    const q = this.searchTerm.trim();
    if (!q) return;
    if (this.role === 'ROLE_CUSTOMER') {
      this.router.navigate(['/customer/vehicles'], { queryParams: { q } });
    } else if (this.role === 'ROLE_DEALER') {
      this.router.navigate(['/dealer/vehicles'], { queryParams: { q } });
    } else {
      this.router.navigate(['/login']);
    }
    this.closeAllMenus();
  }

  toggleProfile(event: MouseEvent) {
    event.stopPropagation();
    this.profileOpen = !this.profileOpen;
    this.mobileNavOpen = false;
  }

  toggleMobileNav(event: MouseEvent) {
    event.stopPropagation();
    this.mobileNavOpen = !this.mobileNavOpen;
    this.profileOpen = false;
  }

  logout() {
    this.auth.logout();
    this.closeAllMenus();
    this.router.navigateByUrl('/login');
  }

  goHome() {
    this.closeAllMenus();
    this.router.navigateByUrl(this.auth.getHomeRoute(this.role));
  }

  closeAllMenus() {
    this.profileOpen = false;
    this.mobileNavOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.closeAllMenus();
  }

  private buildNavLinks(role: UserRole | null): NavItem[] {
    if (role === 'ROLE_CUSTOMER') {
      return [
        { label: 'Vehicles', path: '/customer/vehicles' },
        { label: 'Bookings', path: '/customer/bookings' },
        { label: 'Favorites', path: '/customer/favorites' },
        { label: 'Reviews', path: '/customer/reviews' },
      ];
    }

    if (role === 'ROLE_DEALER') {
      return [
        { label: 'Vehicles', path: '/dealer/vehicles' },
        { label: 'Bookings', path: '/dealer/bookings' },
      ];
    }

    if (role === 'ROLE_ADMIN') {
      return [
        { label: 'Dealers', path: '/admin/dealers' },
        { label: 'Customers', path: '/admin/customers' },
      ];
    }

    return [
      { label: 'Home', path: '/home' },
      { label: 'Browse', path: '/login' },
    ];
  }
}
