
import { trigger, state, style, animate, transition, query, stagger } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('500ms', style({ opacity: 1 }))]
    ),
    transition(':leave',
      [style({ opacity: 0.5 }),
    animate('1000ms', style({ opacity: 0 }))]
    )
  ]);

