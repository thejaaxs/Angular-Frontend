import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FavoritesApi } from '../../../api/favorites.service';
import { Favorite } from '../../../shared/models/favorite.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './favorite-edit.component.html',
  styleUrl: './favorite-edit.component.css'
})
export class FavoriteEditComponent implements OnInit {
  oldName = '';
  model!: Favorite;
  loaded = false;
  saving = false;

  constructor(
    private api: FavoritesApi,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.oldName = decodeURIComponent(this.route.snapshot.paramMap.get('dealerName') || '');
    this.api.byName(this.oldName).subscribe({
      next: (res) => {
        this.model = res[0];
        this.loaded = true;
      },
      error: (err: HttpErrorResponse) => {
        const msg = typeof err.error === 'string' ? err.error : err.error?.message;
        this.toast.error(msg || 'Failed to load favorite');
        this.router.navigateByUrl('/customer/favorites');
      },
    });
  }

  submit() {
    this.saving = true;
    this.api.updateByName(this.oldName, this.model).subscribe({
      next: () => {
        this.toast.success('Updated');
        this.router.navigateByUrl('/customer/favorites');
      },
      error: (err: HttpErrorResponse) => {
        const msg = typeof err.error === 'string' ? err.error : err.error?.message;
        this.toast.error(msg || 'Update failed');
      },
      complete: () => {
        this.saving = false;
      }
    });
  }
}

