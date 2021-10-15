import React from 'react';
import { IconButton, HStack, Icon, Colors } from '@chakra-ui/react';
import { TRatingsIcon, getRatingsIcon } from 'lib/utils/ratingsIcon';

type Props = {
  numOptions: number;
  iconType: TRatingsIcon;
  value?: number;
  onChange?: (newVal: number) => void;
};

export const IconRating: React.FC<Props> = ({
  value,
  numOptions,
  iconType,
  onChange,
}) => {
  const [rating, setRating] = React.useState(value ?? 0);
  const [hover, setHover] = React.useState(value ?? 0);
  const MyIcon = getRatingsIcon(iconType);

  return (
    <HStack align="center" spacing={1} justifyContent="center">
      {Array.from({ length: numOptions }, (_, idx) => {
        const color =
          hover !== -1
            ? idx + 1 <= hover
              ? 'brand.400'
              : 'brand.800'
            : idx + 1 <= rating
            ? 'brand.400'
            : 'brand.800';
        return (
          <IconButton
            key={idx}
            aria-label={`${idx + 1}-star rating`}
            icon={<MyIcon />}
            color={color}
            size="md"
            variant="ghost"
            onClick={() => {
              setRating(idx + 1);
              onChange && onChange(idx + 1);
            }}
            onMouseEnter={() => setHover(idx + 1)}
            onMouseLeave={() => setHover(-1)}
          />
        );
      })}
    </HStack>
  );
};
