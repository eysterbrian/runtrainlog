import React from 'react';

import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  HStack,
  Text,
} from '@chakra-ui/react';

type Props = {
  initTotalSeconds?: number;
  onChange?: (totalSeconds: number) => void;
};

/**
 * Display adjacent number pickers for minutes and seconds. The picker receives and returns
 * values as a **total number of seconds**.
 * @param initTotalSeconds?
 * @param onChange?
 * @returns
 */
export const MinSecPicker: React.FC<Props> = ({
  initTotalSeconds,
  onChange,
}) => {
  //
  // Helper functions for converting between totalSeconds and min:sec values
  //
  const getMinutesFromTotalSeconds = (totalSeconds: number | undefined) =>
    totalSeconds ? Math.floor(totalSeconds / 60) : 0;
  const getSecondsFromTotalSeconds = (totalSeconds: number | undefined) =>
    totalSeconds ? totalSeconds % 60 : 0;
  const getTotalSecondsFromMinSec = (min: number, sec: number) => {
    return minutes * 60 + seconds;
  };

  // state for our 2 controlled components
  const [minutes, setMinutes] = React.useState(
    getMinutesFromTotalSeconds(initTotalSeconds)
  );
  const [seconds, setSeconds] = React.useState<string>(
    getSecondsFromTotalSeconds(initTotalSeconds).toString().padStart(2, '0')
  );

  const handleChangeMinutes = (newMinutes: number) => {
    setMinutes(newMinutes);
    if (onChange) {
      // Make sure to use our newMinutes value, since the setMinutes call won't update until next render
      onChange(newMinutes * 60 + parseInt(seconds));
    }
  };
  const handleChangeSeconds = (newSeconds: number) => {
    setSeconds(newSeconds.toString().padStart(2, '0'));
    if (onChange) {
      onChange(minutes * 60 + newSeconds);
    }
  };

  return (
    <HStack
      width="max-content"
      border="1px solid var(--chakra-colors-whiteAlpha-300)" // HACK: should specify border color using chakra variable
      rounded="md"
      onFocus={(evt: React.FocusEvent) => {
        console.log('Focused inside the component');
      }}
      onBlur={(evt: React.FocusEvent) => {
        console.log('Blurred the component');
      }}>
      <NumberInput
        value={minutes}
        size="md"
        maxW={20}
        min={0}
        step={1}
        precision={0}
        inputMode="numeric"
        allowMouseWheel
        onChange={(_, valueAsNumber) => handleChangeMinutes(valueAsNumber)}>
        <NumberInputField border={0} rounded="none" textAlign="right" />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <Text size="lg" fontWeight="extrabold">
        :
      </Text>
      <NumberInput
        value={seconds}
        inputMode="numeric"
        allowMouseWheel
        size="md"
        maxW={20}
        min={0}
        max={59}
        step={1}
        onChange={(_, valueAsNumber) => handleChangeSeconds(valueAsNumber)}>
        <NumberInputField border={0} rounded="none" text-align="left" pl={2} />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </HStack>
  );
};
