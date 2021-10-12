import React from 'react';
import { IconButton, HStack, Icon, Colors } from '@chakra-ui/react';
import { TRatingsIcon, getRatingsIcon } from 'lib/utils/ratings';

type Props = {
  initValue: number;
  numOptions: number;
  iconType: TRatingsIcon;
};

export const IconRating: React.FC<Props> = ({
  initValue,
  numOptions,
  iconType,
}) => {
  const [rating, setRating] = React.useState(initValue);
  const [hover, setHover] = React.useState(initValue);
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
            onClick={() => setRating(idx + 1)}
            onMouseEnter={() => setHover(idx + 1)}
            onMouseLeave={() => setHover(-1)}
          />
        );
      })}
    </HStack>
  );
};
