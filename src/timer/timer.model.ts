import { Duration } from "date-fns";
import { ReplaySubject } from "rxjs";

/**
 * Enum representing the different timer IDs.
 */
export enum TimerId {
  'default' = 'default',
  'confirm' = 'confirm',
};

/**
 * Interface representing the state of a timer.
 */
export interface TimerState {
  /**
   * The ID of the timer.
   */
  id: TimerId;
  /**
   * The value of the timer in seconds.
   */
  value: number;
}

/**
 * Interface representing the display state of a timer.
 */
export interface TimerStateDisplay {
  /**
   * The value of the timer in seconds.
   */
  value: number;
  /**
   * The display duration of the timer, or null if not set.
   */
  display: Duration | null;
  /**
   * The percentage of the timer that has elapsed, or undefined if not applicable.
   */
  percent?: number;
}

/**
 * Interface representing the data associated with a timer.
 */
export interface TimerData {
  /**
   * The current state of the timer.
   */
  state: TimerState;
  /**
   * A subject that monitors the display state of the timer.
   */
  monitor: ReplaySubject<TimerStateDisplay>;
  /**
   * A subject that indicates whether the timer has ended.
   */
  ended: ReplaySubject<boolean>;
  /**
   * The interval of the timer in milliseconds, or null if not set.
   */
  interval?: number | null;
}

/**
 * The default timer state with an ID of 'default' and a value of 56 minutes.
 */
export const defaultTimer: TimerState = { id: TimerId.default, value: 56 * 60 };
