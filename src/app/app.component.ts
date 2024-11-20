import { Component, inject } from '@angular/core';
import { defaultTimer, TimerId } from '../timer/timer.model';
import { TimerService } from '../timer/timer.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  providers: [TimerService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly timer = defaultTimer;

  protected timerService = inject(TimerService);

  ngOnInit(): void {
    this.timerService.setTimer(defaultTimer);
    this.timerService.start(TimerId.default);
  }

  ngOnDestroy(): void {
    this.timerService.stop(TimerId.default);
  }
}
