import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Box,
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
  Checkbox,
  CheckboxProps,
  Flex,
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
  useRowSelect,
} from 'react-table';
import { Workout } from '@prisma/client';
import { useSession } from 'next-auth/client';
import { useMutation, useQueryClient } from 'react-query';
import { parseISO, format, isValid } from 'date-fns';
import { fetchDeleteManyWorkouts } from 'lib/queries/fetchDeleteWorkout';
import { LoadingModal } from 'components/Loading';
import { DeleteWorkoutConfirm } from './DeleteWorkoutAlert';
import { getRatingsIconComponent } from './IconRatingDisplay';
import { getPaceStr, getWeekOfYearStr } from 'lib/utils/units';
import { useHotkeys } from 'react-hotkeys-hook';

type Props = {
  workouts: Workout[];
};

/**
 * Simple wrapper around ChakraUI's Checkbox to transfer prop values from the DOM API prop name to the non-standard
 * prop names used by Chakra's Checkbox.
 *
 * This is required for several of react-table's
 * built-in getXXXProps() methods to work properly.
 *
 * The transferred props are:
 *    indeterminate -> isIndeterminiate (Chakra's prop name)
 *    checked -> isChecked (Chakra's prop name)
 */
const IndeterminateCheckbox: React.FC<
  CheckboxProps & { indeterminate?: boolean; checked?: boolean }
> = ({ indeterminate, checked, ...props }) => {
  return (
    <Checkbox
      isIndeterminate={typeof indeterminate === 'boolean' && indeterminate}
      isChecked={typeof checked === 'boolean' && checked}
      {...props}
    />
  );
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
        accessor: 'paceSecPerMile',
        isNumeric: true,
        Cell: ({ value: mph }: { value: number }) =>
          !mph ? '-' : getPaceStr(mph),
        disableGroupBy: true,
        aggregate: 'average',
        Aggregated: ({ value }) => (
          <Tooltip label={`Avg ${getPaceStr(value)}`}>
            <Text>{getPaceStr(value)}</Text>
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

  const toast = useToast();

  const deleteManyWorkoutsMutation = useMutation(fetchDeleteManyWorkouts, {
    onSuccess: () => {
      console.log('Invalidate queries from addWorkout mutation');
      queryClient.invalidateQueries(['workouts', session?.user?.id]);
    },
  });

  const showConfirmDelete = useDisclosure();

  // Store the list of workoutIds at the time when the delete button is pressed
  const [deleteRowIds, setDeleteRowIds] = React.useState<string[]>([]);

  /**
   * Delete the selected workouts
   */
  const onDeleteSelectedWorkouts = () => {
    const deletedWorkouts = deleteManyWorkoutsMutation.mutate(deleteRowIds, {
      onError: (error) => {
        console.log(error);
        toast({
          title: 'Error Deleting Workout',
          status: 'error',
        });
      },
      onSuccess: (deletedWorkout) => {
        console.log('onSuccess', deletedWorkout);

        toast({
          title: 'Workouts Deleted',
          description: `Successfully deleted ${deleteRowIds.length} workouts.`,
          status: 'success',
          duration: 9000,
          isClosable: true,
        });
      },
      onSettled: () => {
        console.log('onSettled');
        setDeleteRowIds([]);
        showConfirmDelete.onClose();
      },
    });
  };

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
    flatRows,
    setAllFilters,
    prepareRow,
    allColumns,
    toggleGroupBy,
    setSortBy,
    toggleAllRowsExpanded,
    state: { selectedRowIds, groupBy, sortBy },
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
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: 'modifyRow',
          accessor: 'id',
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <Flex>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </Flex>
          ),
          Cell: ({ row }) => (
            <Flex>
              {' '}
              <IndeterminateCheckbox
                {...row.getToggleRowSelectedProps()}
              />{' '}
            </Flex>
          ),
          disableGroupBy: true,
          disableSortBy: true,
        },
        ...columns,
      ]);
    }
  );

  const isGroupByWeek = groupBy.includes('startTime');

  const handleDeleteRows = () => {
    // Generate a list of workoutId strings for each selected row
    //
    // !! We can't just use 'selectedFlatRows' here because that array
    // will only include visible / expanded rows that have been 'prepared'.
    // Rows that haven't been expanded will not appear in that list.
    // 'selectdRowIds' does correctly return the react-table row id for each
    // row/subrow (whether expanded or not) that has been selected.
    const selectedWorkouts = flatRows
      .filter((row) => selectedRowIds[row.id])
      .map((row) => row.original?.id);

    // Set this array in our state, so the mutation can later use this value
    setDeleteRowIds(selectedWorkouts);

    showConfirmDelete.onOpen();
  };

  /**
   * Handlers and hotkeys for groupby summaries and expand/collapse
   */
  useHotkeys('cmd+e', () => toggleAllRowsExpanded(true));
  useHotkeys('cmd+shift+e', () => toggleAllRowsExpanded(false));

  function toggleSummaries() {
    toggleGroupBy('startTime');
    // We're toggling groupBy 'on', so make sure to sort by startTime column as well
    if (!isGroupByWeek) {
      setSortBy([...sortBy, { id: 'startTime', desc: false }]);
    }
  }

  useHotkeys('ctrl+e', toggleSummaries);

  // react-table returns the key prop automatically
  /* eslint-disable react/jsx-key */
  return (
    <>
      <LoadingModal showLoadingModal={deleteManyWorkoutsMutation.isLoading} />
      <HStack spacing={4}>
        <Box>
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
              <MenuItem
                command="⌘E"
                onClick={() => toggleAllRowsExpanded(true)}>
                Expand All
              </MenuItem>
              <MenuItem
                command="⇧⌘E"
                onClick={() => toggleAllRowsExpanded(false)}>
                Collapse All
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>

        <Box>
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
        </Box>
        <Box>
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
        </Box>

        <IconButton
          aria-label="Delete rows"
          icon={<DeleteIcon />}
          size="md"
          variant="ghost"
          disabled={
            deleteManyWorkoutsMutation.isLoading ||
            showConfirmDelete.isOpen ||
            Object.keys(selectedRowIds).length === 0
          }
          onClick={() => handleDeleteRows()}
        />
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
        numWorkouts={deleteRowIds.length}
        onDeleteHandler={onDeleteSelectedWorkouts}
      />
    </>
  );
};
/* eslint-enable react/jsx-key */
