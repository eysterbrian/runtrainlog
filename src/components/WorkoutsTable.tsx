import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Badge,
  chakra,
  VisuallyHidden,
  Menu,
  MenuButton,
  MenuOptionGroup,
  Button,
  IconButton,
  MenuList,
  MenuItemOption,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
} from '@chakra-ui/react';
import {
  TriangleDownIcon,
  TriangleUpIcon,
  DeleteIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons';
import { FocusableElement } from '@chakra-ui/utils';
import { useTable, useSortBy, useFilters, Column, Row } from 'react-table';
import { Workout } from '@prisma/client';
import { useSession } from 'next-auth/client';
import { useMutation, useQueryClient } from 'react-query';
import { parseISO, format, addSeconds, isValid } from 'date-fns';
import { TRatingsIcon, getRatingsIcon } from 'lib/utils/ratingsIcon';
import { fetchDeleteWorkout } from 'lib/queries/fetchDeleteWorkout';
import { Loading, LoadingModal } from 'components/Loading';

type Props = {
  workouts: Workout[];
};

/**
 * HOC that returns a component for use with the Column's Cell option
 * @param iconType
 * @returns
 */
function getRatingsIconComponent(
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

/**
 * Displays table view of the given workouts
 * @param workouts Array of workouts
 * @returns
 */
export const WorkoutsTable: React.FC<Props> = ({ workouts }) => {
  /**
   * Define the columns for the table
   */
  const columns: Array<Column<Workout>> = React.useMemo(
    () => [
      {
        Header: 'Description',
        accessor: 'description',
      },
      {
        Header: 'Modality',
        accessor: 'modality',
        Cell: ({ value }) => {
          if (!value) return 'Unknown';
          const colorScheme = value === 'RUN' ? 'green' : 'yellow';
          return (
            <Badge variant="solid" colorScheme={colorScheme}>
              {value}
            </Badge>
          );
        },
      },
      {
        Header: 'Workout Type',
        accessor: 'workoutType',
        Cell: ({ value }) => {
          if (!value) return 'Unknown';
          return (
            <Badge variant="outline" colorScheme="brand">
              {value}
            </Badge>
          );
        },
      },
      {
        Header: 'Date',
        accessor: 'startTime',
        Cell: ({ value }) => {
          // Type of value isn't really Date, despite using Workout as the type
          // The API returns the value as JSON which converts it to type string
          // So we force cast of the value to a string then parse it.
          const date: Date = parseISO(value as unknown as string);
          return !value ? 'Unknown Date' : format(date, 'EEEE, M/d/y');
        },
      },
      { Header: 'Distance (miles)', accessor: 'distance', isNumeric: true },
      { Header: 'Elevation (feet)', accessor: 'elevation', isNumeric: true },
      {
        Header: 'Pace',
        accessor: 'pace',
        isNumeric: true,
        Cell: ({ value: mph }) => {
          if (!mph) return 'Unknown';
          const paceMinutes = addSeconds(new Date(0), (60 / mph) * 60);
          return format(paceMinutes, 'm:ss');
        },
      },
      {
        Header: 'Energy',
        accessor: 'ratingEnergy',
        isNumeric: true,
        Cell: getRatingsIconComponent('Energy'),
      },
      {
        Header: 'Difficulty',
        accessor: 'ratingDifficulty',
        isNumeric: true,
        Cell: getRatingsIconComponent('Difficulty'),
      },
      {
        Header: 'General',
        accessor: 'ratingGeneral',
        isNumeric: true,
        Cell: getRatingsIconComponent('Star'),
      },
    ],
    []
  );
  const data = React.useMemo<Workout[]>(() => workouts, [workouts]);

  const [session] = useSession();
  const queryClient = useQueryClient();
  const deleteWorkoutMutation = useMutation(fetchDeleteWorkout, {
    onSuccess: () => {
      console.log('Invalidate queries from addWorkout mutation');
      queryClient.invalidateQueries(['workouts', session?.user?.id]);
    },
  });
  const toast = useToast();

  const showConfirmDelete = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);
  const [deleteRow, setDeleteRow] = React.useState<Workout>();

  const DeleteIconButton: React.FC<{ row: Row<Workout> }> = React.useCallback(
    ({ row }) => (
      <IconButton
        aria-label="Delete row"
        icon={<DeleteIcon />}
        variant={deleteWorkoutMutation.isLoading ? 'ghost' : 'solid'}
        // BUG: button never gets disabled
        disabled={deleteWorkoutMutation.isLoading}
        onClick={() => {
          setDeleteRow(row.original);
          showConfirmDelete.onOpen();
        }}
      />
    ),
    [deleteWorkoutMutation, showConfirmDelete]
  );

  const {
    getTableBodyProps,
    getTableProps,
    headerGroups,
    rows,
    setAllFilters,
    prepareRow,
    allColumns,
  } = useTable({ columns, data: workouts }, useFilters, useSortBy, (hooks) => {
    hooks.visibleColumns.push((columns) => [
      {
        id: 'modifyRow',
        accessor: 'id',
        Cell: ({ row }) => <DeleteIconButton row={row} />,
      },
      ...columns,
    ]);
  });

  // Calculate date of the row to be deleted for use in confirmation dialog
  let deleteRowDate: Date | undefined = undefined;
  if (deleteRow) {
    deleteRowDate = parseISO(deleteRow?.startTime as unknown as string);
  }
  const deleteWorkoutDateStr =
    !deleteRowDate || !isValid(deleteRowDate)
      ? 'Unknown Date'
      : format(deleteRowDate, 'EEEE, M/d/y');

  // react-table returns the key prop automatically
  /* eslint-disable react/jsx-key */
  return (
    <>
      <LoadingModal showLoadingModal={deleteWorkoutMutation.isLoading} />
      <HStack spacing={4}>
        <Menu closeOnSelect={false}>
          <MenuButton
            rightIcon={<ChevronDownIcon />}
            size="xs"
            as={Button}
            colorScheme="brand"
            rounded="sm"
            py={1}>
            Columns
          </MenuButton>
          <MenuList minWidth="240px">
            {allColumns.map((column) => {
              return (
                <MenuItemOption
                  key={column.id}
                  value={column.id}
                  isChecked={column.isVisible}
                  onClick={() => column.toggleHidden()}>
                  {column.id}
                </MenuItemOption>
              );
            })}
          </MenuList>
        </Menu>

        <Menu closeOnSelect={false}>
          <MenuButton
            rightIcon={<ChevronDownIcon />}
            size="xs"
            as={Button}
            colorScheme="secondary"
            rounded="sm"
            py={1}>
            Filters
          </MenuButton>
          <MenuList minWidth="240px">
            <MenuOptionGroup defaultValue="all" type="radio">
              <MenuItemOption value="all" onClick={() => setAllFilters([])}>
                All Workouts
              </MenuItemOption>
              <MenuItemOption
                value="onlyRuns"
                onClick={() =>
                  setAllFilters([{ id: 'modality', value: 'RUN' }])
                }>
                All Runs
              </MenuItemOption>
              <MenuItemOption
                value="onlyLongRuns"
                onClick={() =>
                  setAllFilters([
                    { id: 'modality', value: 'RUN' },
                    { id: 'workoutType', value: 'LONG' },
                  ])
                }>
                Long Runs
              </MenuItemOption>
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </HStack>

      <Table {...getTableProps()}>
        <Thead>
          {headerGroups.map((headerGroup) => (
            <Tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <Th
                  // resize="horizontal"
                  // overflow="hidden"
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  isNumeric={column.isNumeric}>
                  {column.render('Header')}
                  <chakra.span pl="4">
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <TriangleDownIcon aria-label="sorted descending" />
                      ) : (
                        <TriangleUpIcon aria-label="sorted ascending" />
                      )
                    ) : null}
                  </chakra.span>
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <Tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <Td
                    {...cell.getCellProps()}
                    isNumeric={cell.column.isNumeric}>
                    {cell.render('Cell')}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      <AlertDialog
        isOpen={showConfirmDelete.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={showConfirmDelete.onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Workout
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the{' '}
              <strong>{deleteWorkoutDateStr}</strong> workout? You cannot undo
              this action.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={showConfirmDelete.onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  const deletedWorkout = deleteWorkoutMutation.mutate(
                    deleteRow?.id ?? '',
                    {
                      onError: (error) => {
                        console.log(error);
                        toast({
                          title: 'Error Deleting Workout',
                          status: 'error',
                        });
                      },
                      onSuccess: (deletedWorkout) => {
                        console.log('onSuccess', deletedWorkout);

                        const date: Date = parseISO(
                          deletedWorkout?.startTime as unknown as string
                        );
                        const dateStr = !date
                          ? 'Unknown Date'
                          : format(date, 'EEEE, M/d/y');

                        toast({
                          title: 'Workout Deleted.',
                          description: `The workout from ${dateStr} is deleted.`,
                          status: 'success',
                          duration: 9000,
                          isClosable: true,
                        });
                      },
                      onSettled: () => {
                        console.log('onSettled');
                        setDeleteRow(undefined);
                        showConfirmDelete.onClose();
                      },
                    }
                  );
                }}
                ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
/* eslint-enable react/jsx-key */
