import { toTitleCase } from '../lib/utils/stringUtils';

describe('toTitleCase', () => {
  it('basic setup', () => {
    expect(toTitleCase('INLINE_SKATE')).toEqual('Inline Skate');
    expect(toTitleCase('RUN')).toEqual('Run');
    expect(toTitleCase('CROSS-TRAIN')).toEqual('Cross-Train');
    // expect(toTitleCase('INLINE SKATE')).toEqual('INLINE SKATE');
  });
});
