import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../shared/components/navbar/navbar';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Navbar],
  template: `
    <app-navbar />
    <main class="container py-4">
      <router-outlet />
    </main>
    <footer class="text-center text-muted small py-3">
      Sistema Bancario &middot; Angular + Node.js + PostgreSQL
    </footer>
  `,
})
export class Layout {}
