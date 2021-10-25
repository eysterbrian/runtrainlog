import { TRatingsIcon, getRatingsIcon } from 'lib/utils/ratingsIcon';
import { HStack, VisuallyHidden } from '@chakra-ui/react';

/**
 * HOC that returns a component for use with the react-table Column's Cell option
 * @param iconType
 * @returns JSX component
 */
export function getRatingsIconComponent(
  iconType: TRatingsIcon
): React.FC<{ value: number }> {
  const MyIcon = getRatingsIcon(iconType);
  const StarRating: React.FC<{ value: number }> = ({ value }) => {
    return (
      <HStack wrap="nowrap" justifyContent="flex-end" spacing={0}>
        <VisuallyHidden>{value}</VisuallyHidden>
        {Array.from({ length: value }, (_, idx) => (
          <MyIcon key={idx} />
        ))}
      </HStack>
    );
  };
  return StarRating;
}
