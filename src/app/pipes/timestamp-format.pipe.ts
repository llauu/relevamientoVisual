import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from 'firebase/firestore';

@Pipe({
  name: 'timestampFormat',
  standalone: true
})
export class TimestampFormatPipe implements PipeTransform {

  transform(value: Timestamp | null): string {
    if (value instanceof Timestamp) {
      const date = value.toDate(); 
      return formatDate(date, 'd MMM. y', 'en-US'); 
    }
    return '';
  }
}
