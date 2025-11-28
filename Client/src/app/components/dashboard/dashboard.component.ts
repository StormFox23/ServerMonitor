import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Dashboard content is currently in app.component.html -->
  `,
  styles: [
    `:host { display: block; padding: 16px }
    .hero { padding: 20px; background: linear-gradient(90deg, #f3f7ff, #ffffff); border-radius: 10px; }
    .hero h2 { margin: 0 0 8px; }
    .hero p { margin: 0; color: #666; }
    .quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 12px; }
    .action-card { padding: 12px; border-radius: 8px; background: white; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .action-card h4 { margin: 0 0 6px; }
    .action-card p { margin: 0; color: #555; }
    `
  ]
})
export class DashboardComponent { }
