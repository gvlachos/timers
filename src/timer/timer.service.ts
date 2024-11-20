import { inject, Injectable, NgZone } from '@angular/core';
import { add, Duration, intervalToDuration } from 'date-fns';
import { Observable, of, ReplaySubject, take } from 'rxjs';
import { defaultTimer, TimerData, TimerId, TimerState, TimerStateDisplay } from './timer.model';

/**
 * TimerService is an injectable service that manages multiple timers.
 * It provides methods to set, start, stop, reset, and update timers.
 */
@Injectable()
export class TimerService {
  /**
   * The default state of the timer.
   */
  readonly defaultTimerState = defaultTimer;

  /**
   * A map to store timer data by their IDs.
   */
  private timers: Map<string, TimerData> = new Map();

  /**
   * An instance of Angular's `NgZone` service, used to execute the timer update inside the Angular zone.
   */
  private ngZone = inject(NgZone);

  /**
   * Sets a new timer with the given state.
   * @param state - The state of the timer to be set.
   */
  setTimer(state: TimerState): void {
    const timerData: TimerData = {
      state,
      monitor: new ReplaySubject<TimerStateDisplay>(),
      ended: new ReplaySubject<boolean>(),
    }
    this.timers.set(state.id, timerData);
  }

  /**
   * Retrieves the timer data for the given ID.
   * @param id - The ID of the timer to retrieve.
   * @returns The timer data if found, otherwise undefined.
   */
  getTimer(id: TimerId): TimerData | undefined {
    return this.timers.get(id);
  }

  /**
   * Starts the timer with the given ID.
   * @param id - The ID of the timer to start.
   * @returns An observable that emits the timer state display or null if the timer is not found.
   */
  start(id: TimerId): Observable<TimerStateDisplay | null> {
    const timer = this.getTimer(id);

    if (!timer) return of(null);

    timer.ended.next(false);
    this.countdown(id, timer.state);
    return timer.monitor.asObservable();
  }

  /**
   * Stops the timer with the given ID.
   * @param id - The ID of the timer to stop.
   * @returns An observable that emits true if the timer was stopped, otherwise false.
   */
  stop(id: TimerId): Observable<boolean> {
    const timer = this.getTimer(id);

    if (!timer) return of(false);

    this.clearInterval(id);
    timer.monitor.next({
      ...this.defaultTimerState,
      display: null,
    });
    timer.ended.next(true);
    return timer.ended.asObservable();
  }

  /**
   * Resets the timer with the given ID.
   * @param id - The ID of the timer to reset.
   * @returns An observable that emits the timer state display or null if the timer is not found.
   */
  reset(id: TimerId): Observable<TimerStateDisplay | null> {
    return this.start(id);
  }

  /**
   * Pads a number with leading zeros to ensure it has at least two digits.
   * @param value - The number to pad.
   * @returns The padded number as a string.
   */
  zeroPad(value?: number): string {
    return !!value ? `${value}`.padStart(2, '0'): '00';
  };

  /**
   * Clears the interval for the timer with the given ID.
   * @param id - The ID of the timer to clear the interval for.
   */
  private clearInterval(id: TimerId): void {
    const timer = this.getTimer(id);

    if (!timer) return;

    if (timer.interval) {
      clearInterval(timer.interval);
      timer.interval = null;
    }
  }

  /**
   * Updates the timer state display for the given ID.
   * @param id - The ID of the timer to update.
   * @param state - The new state display of the timer.
   */
  private update(id: TimerId, state: TimerStateDisplay): void {
    this.ngZone.run(() => {
      const timer = this.getTimer(id);
      const hasValue = !!state.display?.hours ||!!state.display?.minutes ||!!state.display?.seconds;

      if (!timer) return;

      if (!hasValue) {
        this.clearInterval(id);
        this.stop(id).pipe(take(1)).subscribe();
      } else {
        timer.monitor.next(state);
      }
    });
  }

  /**
   * Starts the countdown for the timer with the given ID.
   * @param id - The ID of the timer to start the countdown for.
   * @param state - The state of the timer.
   */
  private countdown(id: TimerId, state: TimerState): void {
    const timer = this.getTimer(id);
    const start = new Date();

    if (!timer) return;

    this.clearInterval(id);

    this.calculate(id, state, start);

    timer.interval = window.setInterval(() => {
      this.calculate(id, state, start);
    }, 300);
  }

  /**
   * Calculates the remaining duration and updates the timer state display for the given ID.
   * @param id - The ID of the timer to calculate the duration for.
   * @param state - The state of the timer.
   * @param start - The start time of the timer.
   */
  private calculate(id: TimerId, state: TimerState, start: Date ): void {
    const {display, remaining} = this.getDuration(start, new Date(), state);
    const percent = state.value ? (remaining * 100) / state.value : undefined;

    this.update(id, {...state, display, percent});
  }

  /**
   * Calculates the duration and remaining time for a timer.
   *
   * @param start - The start time of the timer.
   * @param now - The current time.
   * @param state - The state of the timer, which includes the duration value.
   * @returns An object containing the display duration and the remaining time in seconds.
   */
  private getDuration(start: Date, now: Date, state: TimerState): {display: Duration, remaining: number} {
    const end = add(start, {seconds: state.value});
    const display = intervalToDuration({ start: now, end });
    const remaining = (end.getTime() - now.getTime()) / 1000;
    return {display, remaining};
  }
}
