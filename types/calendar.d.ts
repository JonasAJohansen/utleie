// Add calendar component type declarations
import { DayPicker } from 'react-day-picker';

declare module 'react-day-picker' {
  interface DayPickerBase {
    onSelect?: (date: Date | undefined) => void;
  }
} 