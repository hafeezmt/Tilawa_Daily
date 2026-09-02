export interface PlaybackSpeedOption {
  value: number;
  label: string;
}

export const PLAYBACK_SPEED_OPTIONS: PlaybackSpeedOption[] = [
  { value: 0.75, label: '0.75x (Slow / Tajweed Study)' },
  { value: 1.0, label: '1.0x (Normal Pace)' },
  { value: 1.25, label: '1.25x (Moderate)' },
  { value: 1.5, label: '1.5x (Fast Review)' }
];
