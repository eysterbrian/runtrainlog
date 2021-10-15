import { BsLightningFill, BsLightning } from 'react-icons/bs';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { FaMountain } from 'react-icons/fa';
import { IconType } from 'react-icons';

/**
 * Types of icons
 */
export type TRatingsIcon = 'Star' | 'Energy' | 'Difficulty';

/**
 * Returns the Chakra Icon for the given iconType
 * @param iconType
 * @returns a Chakra Icon component
 */
export function getRatingsIcon(iconType: TRatingsIcon): IconType {
  let MyIcon: IconType;
  switch (iconType) {
    case 'Energy':
      MyIcon = BsLightningFill;
      break;
    case 'Difficulty':
      MyIcon = FaMountain;
      break;
    case 'Star':
    default:
      MyIcon = AiFillStar;
      break;
  }
  return MyIcon;
}
