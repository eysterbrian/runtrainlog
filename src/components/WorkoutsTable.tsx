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
  Menu,
  MenuButton,
  MenuItem,
  MenuOptionGroup,
  Button,
  IconButton,
  MenuList,
  Text,
  Tooltip,
  MenuItemOption,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import {
  TriangleDownIcon,
  TriangleUpIcon,
  DeleteIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  AddIcon,
} from '@chakra-ui/icons';
import {
  useTable,
  useSortBy,
  useFilters,
  Column,
  Row,
  useGroupBy,
  useExpanded,
  TableOptions,
} from 'react-table';
import { Workout } from '@prisma/client';
import { useSession } from 'next-auth/client';
import { useMutation, useQueryClient } from 'react-query';
import { parseISO, format, isValid } from 'date-fns';
import { fetchDeleteWorkout } from 'lib/queries/fetchDeleteWorkout';
import { LoadingModal } from 'components/Loading';
import { DeleteWorkoutConfirm } from './DeleteWorkoutAlert';
import { getRatingsIconComponent } from './IconRatingDisplay';
import { getMphToMinutes, getWeekOfYearStr } from 'lib/utils/units';
import { useHotkeys } from 'react-hotkeys-hook';

type Props = {
  workouts: Workout[];
};

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
        Header: 'Date',
        accessor: 'startTime',
        Cell: ({ value }) => {
          // Type of value isn't really Date, despite using Workout as the type
          // The API returns the value as JSON which converts it to type string
          // So we force cast of the value to a string then parse it.
          const date: Date = parseISO(value as unknown as string);
          return !value ? '?' : `${format(date, 'EEEE, M/d/y')}`;
        },
        Aggregated: ({ value }) => `Week #${getWeekOfYearStr(value)}`,
      },
      {
        Header: 'Description',
        accessor: 'description',
        aggregate: 'count',
        Aggregated: ({ value }) => `${value} workouts`,
        disableGroupBy: true,
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
        disableGroupBy: true,
        aggregate: (values) =>
          values.reduce(
            (count, currModality) => count + (currModality === 'RUN' ? 1 : 0),
            0
          ),
        Aggregated: ({ value }) => `${value} ${value === 1 ? 'run' : 'runs'}`,
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
        disableGroupBy: true,
        aggregate: (values) =>
          values.reduce(
            (count, currModality) =>
              count + (currModality === 'CROSSTRAIN' ? 1 : 0),
            0
          ),
        Aggregated: ({ value }) => `${value} x-train`,
      },

      {
        Header: 'Distance (miles)',
        accessor: 'distance',
        isNumeric: true,
        disableGroupBy: true,
        aggregate: 'sum',
        Cell: ({ value }) =>
          typeof value === 'number' ? Math.round(value * 100) / 100 : '-',
        Aggregated: ({ value }) => (
          <Tooltip
            label={`Total ${(Math.round(value * 100) / 100).toLocaleString(
              'en-US'
            )} miles`}>
            <Text>{(Math.round(value * 10) / 10).toLocaleString('en-US')}</Text>
          </Tooltip>
        ),
      },
      {
        Header: 'Elevation (feet)',
        accessor: 'elevation',
        isNumeric: true,
        disableGroupBy: true,
        aggregate: 'sum',
        Cell: ({ value }) =>
          typeof value === 'number' ? Math.round(value) : '-',
        Aggregated: ({ value }) => (
          <Tooltip
            label={`Total ${(Math.round(value * 10) / 10).toLocaleString(
              'en-US'
            )} feet`}>
            <Text>{Math.round(value).toLocaleString('en-US')}</Text>
          </Tooltip>
        ),
      },
      {
        Header: 'Pace',
        accessor: 'pace',
        isNumeric: true,
        Cell: ({ value: mph }: { value: number }) =>
          !mph ? '-' : getMphToMinutes(mph),
        disableGroupBy: true,
        aggregate: 'average',
        Aggregated: ({ value }) => (
          <Tooltip label={`Avg ${getMphToMinutes(value)}`}>
            <Text>{getMphToMinutes(value)}</Text>
          </Tooltip>
        ),
      },
      {
        Header: 'Energy',
        accessor: 'ratingEnergy',
        isNumeric: true,
        Cell: getRatingsIconComponent('Energy'),
        disableGroupBy: true,
        aggregate: 'average',
        Aggregated: ({ value }) => `${Math.round(value * 10) / 10}`,
      },
      {
        Header: 'Difficulty',
        accessor: 'ratingDifficulty',
        isNumeric: true,
        Cell: getRatingsIconComponent('Difficulty'),
        disableGroupBy: true,
        aggregate: 'average',
        Aggregated: ({ value }) => `${Math.round(value * 10) / 10}`,
      },
      {
        Header: 'General',
        accessor: 'ratingGeneral',
        isNumeric: true,
        Cell: getRatingsIconComponent('Star'),
        disableGroupBy: true,
        aggregate: 'average',
        Aggregated: ({ value }) => `${Math.round(value * 10) / 10}`,
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

  const showConfirmDelete = useDisclosure();
  const [deleteRow, setDeleteRow] = React.useState<Workout>();

  const toast = useToast();

  /**
   * Delete the workout
   */
  const onDeleteWorkout = () => {
    const deletedWorkout = deleteWorkoutMutation.mutate(deleteRow?.id ?? '', {
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
        const dateStr = !date ? 'Unknown Date' : format(date, 'EEEE, M/d/y');

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
    });
  };

  // Calculate date of the row to be deleted for use in confirmation dialog
  let deleteRowDate: Date | undefined = undefined;
  if (deleteRow) {
    deleteRowDate = parseISO(deleteRow?.startTime as unknown as string);
  }
  const deleteWorkoutDateStr =
    !deleteRowDate || !isValid(deleteRowDate)
      ? 'Unknown Date'
      : format(deleteRowDate, 'EEEE, M/d/y');

  const DeleteIconButton: React.FC<{ row: Row<Workout> }> = React.useCallback(
    ({ row }) => (
      <IconButton
        aria-label="Delete row"
        icon={<DeleteIcon />}
        size="md"
        variant="ghost"
        // BUG: button never gets disabled
        disabled={deleteWorkoutMutation.isLoading}
        onClick={() => {
          setDeleteRow(row.original);
          showConfirmDelete.onOpen();
        }}
      />
    ),
    [deleteWorkoutMutation.isLoading, showConfirmDelete]
  );

  /**
   * Extends the default groupBy function by grouping by week number of the
   * columnId is the 'startTime' column.
   *
   * (see the implementation of defaultGroupByFn() in
   * react-table/plugin-hooks/useGroupBy.js
   * @param rows - all rows in the table data
   * @param columnId - column to group rows by
   * @returns record with group as key and array of grouped rows as value
   */
  type GroupByFnType = Exclude<TableOptions<Workout>['groupByFn'], undefined>;
  const groupByWeek = React.useCallback<GroupByFnType>((rows, columnId) => {
    return rows.reduce(
      (prev: Record<number | string, Array<Row<Workout>>>, row) => {
        let resKey: string | number = row.values[columnId];
        if (columnId === 'startTime') {
          resKey = !resKey ? 'Unknown' : getWeekOfYearStr(row.values[columnId]);
        }
        prev[resKey] = Array.isArray(prev[resKey]) ? prev[resKey] : [];
        prev[resKey].push(row);
        return prev;
      },
      {}
    );
  }, []);

  const {
    getTableBodyProps,
    getTableProps,
    headerGroups,
    rows,
    state,
    setAllFilters,
    prepareRow,
    allColumns,
    toggleGroupBy,
    setSortBy,
    toggleAllRowsExpanded,
  } = useTable(
    {
      columns,
      data: workouts,
      groupByFn: groupByWeek,
      initialState: {
        groupBy: ['startTime'],
        sortBy: [{ id: 'startTime', desc: true }],
      },
    },
    useFilters,
    useGroupBy,
    useSortBy,
    useExpanded,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: 'modifyRow',
          accessor: 'id',
          Cell: ({ row }) => <DeleteIconButton row={row} />,
          disableGroupBy: true,
          disableSortBy: true,
        },
        ...columns,
      ]);
    }
  );

  const isGroupByWeek = state.groupBy.includes('startTime');

  /**
   * Handlers and hotkeys for groupby summaries and expand/collapse
   */
  useHotkeys('cmd+e', () => toggleAllRowsExpanded(true));
  useHotkeys('cmd+shift+e', () => toggleAllRowsExpanded(false));

  function toggleSummaries() {
    toggleGroupBy('startTime');
    // We're toggling groupBy 'on', so make sure to sort by startTime column as well
    if (!isGroupByWeek) {
      setSortBy([...state.sortBy, { id: 'startTime', desc: false }]);
    }
  }
  useHotkeys('ctrl+e', toggleSummaries);

  // react-table returns the key prop automatically
  /* eslint-disable react/jsx-key */
  return (
    <>
      <LoadingModal showLoadingModal={deleteWorkoutMutation.isLoading} />
      <HStack spacing={4}>
        <Menu closeOnSelect={true}>
          <MenuButton
            rightIcon={<ChevronDownIcon />}
            size="xs"
            as={Button}
            colorScheme="gray"
            rounded="sm"
            py={1}>
            Summary
          </MenuButton>
          <MenuList minWidth="240px">
            <MenuItem command="^E" onClick={toggleSummaries}>
              {isGroupByWeek ? 'Hide' : 'Show'} Weekly Summary
            </MenuItem>
            <MenuItem command="⌘E" onClick={() => toggleAllRowsExpanded(true)}>
              Expand All
            </MenuItem>
            <MenuItem
              command="⇧⌘E"
              onClick={() => toggleAllRowsExpanded(false)}>
              Collapse All
            </MenuItem>
          </MenuList>
        </Menu>

        <Menu closeOnSelect={false}>
          <MenuButton
            rightIcon={<ChevronDownIcon />}
            size="xs"
            as={Button}
            colorScheme="gray"
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
                  {column.id === 'modifyRow' ? 'Delete' : column.Header}
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
            colorScheme="gray"
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
                  {column.canGroupBy ? (
                    // If the column can be grouped, let's add a toggle
                    <span {...column.getGroupByToggleProps()}>
                      {column.isGrouped ? (
                        <CheckCircleIcon color="brand.300" boxSize="4" m="2" />
                      ) : (
                        <AddIcon color="secondary.300" boxSize="3" m="2" />
                      )}
                    </span>
                  ) : null}
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
                    bg={
                      cell.isGrouped
                        ? 'brand.800'
                        : cell.isAggregated
                        ? 'secondary.800'
                        : cell.isPlaceholder
                        ? 'white.800'
                        : 'transparent'
                    }
                    isNumeric={cell.column.isNumeric}>
                    {cell.isGrouped ? (
                      // If it's a grouped cell, add an expander and row count
                      <>
                        <span {...row.getToggleRowExpandedProps()}>
                          {row.isExpanded ? (
                            <ChevronDownIcon boxSize="6" />
                          ) : (
                            <ChevronRightIcon boxSize="6" />
                          )}
                          {cell.render('Aggregated')}
                        </span>{' '}
                      </>
                    ) : cell.isAggregated ? (
                      // If the cell is aggregated, use the Aggregated
                      // renderer for cell
                      cell.render('Aggregated')
                    ) : (
                      cell.render('Cell')
                    )}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      <DeleteWorkoutConfirm
        showDialog={showConfirmDelete}
        workoutDateStr={deleteWorkoutDateStr}
        onDeleteHandler={onDeleteWorkout}
      />
    </>
  );
};
/* eslint-enable react/jsx-key */
