import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraficaComponent } from './board/components/grafica/grafica.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GraficaComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {}