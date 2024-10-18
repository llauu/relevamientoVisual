import { TimestampFormatPipe } from './timestamp-format.pipe';

describe('TimestampFormatPipe', () => {
  it('create an instance', () => {
    const pipe = new TimestampFormatPipe();
    expect(pipe).toBeTruthy();
  });
});
