import React from 'react';
import { useTable, Column, Row, useSortBy } from 'react-table';
import { Workout, WorkoutModality } from '@prisma/client';
import { Table, Thead, Tbody, Tr, Th, Td, Badge, chakra } from '@chakra-ui/react';
import { TFitbitActivity } from 'lib/queries/fetchFitbitActivities';
import { format, parseISO } from 'date-fns';
import { modalityFromFitbitActivity } from 'lib/utils/fitbitUtils';
import { getMphToMinutes } from 'lib/utils/units';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';

/**
 * The parsed API data gets passed as props
 */
type Props = {
  fitbitActivities: TFitbitActivity[];
};

/**
 * We'll convert the raw API data into this internal type
 */
type TFitbitWorkout = {
  startTime: string;
  modality: WorkoutModality;
  distance: number | undefined;
  elevation: number;
  pace: string | undefined;
  heartRate: number;
};

/**
 * Displays table view of the given workouts
 * @param workouts Array of workouts
 * @returns
 */
export const FitbitWorkoutsTable: React.FC<Props> = ({ fitbitActivities }) => {
  /**
   * Convert the raw API data into more usable format
   */
  // TODO: Should we just do all this conversion in the cell render functions?
  const fitbitWorkouts = React.useMemo<TFitbitWorkout[]>(
    () =>
      fitbitActivities.map((activity) => ({
        startTime: activity.startTime,
        modality: modalityFromFitbitActivity(activity.activityName),
        distance: activity?.distance,
        elevation: activity.elevationGain,
        pace: activity.speed ? getMphToMinutes(activity.speed) : undefined,
        heartRate: activity.averageHeartRate,
      })),
    [fitbitActivities]
  );

  /**
   * Define the columns for the table
   */
  const columns: Array<Column<TFitbitWorkout>> = React.useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'startTime',
        Cell: ({ value }) => {
          // Type of value isn't really Date, despite using Workout as the type
          // The API returns the value as JSON which converts it to type string
          // So we force cast of the value to a string then parse it.
          const date: Date = parseISO(value as unknown as string);
          return !value
            ? 'Unknown Date'
            : `${format(date, 'EEEE, M/d/y @ h:mm a')}`;
        },
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
        Header: 'Distance (miles)',
        accessor: 'distance',
        isNumeric: true,
        Cell: ({ value }) =>
          value
            ? `${(Math.round(value * 100) / 100).toLocaleString('en-US')}`
            : '',
      },
      {
        Header: 'Elevation (feet)',
        accessor: 'elevation',
        isNumeric: true,
        Cell: ({ value }) =>
          value
            ? `${(Math.round(value * 10) / 10).toLocaleString('en-US')}`
            : '',
      },
      {
        Header: 'Pace',
        accessor: 'pace',
        isNumeric: true,
      },
      {
        Header: 'Avg Heart Rate',
        accessor: 'heartRate',
        isNumeric: true,
      },
    ],
    []
  );

  const { getTableBodyProps, getTableProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: fitbitWorkouts,
    }, useSortBy);

  // react-table returns the key prop automatically
  /* eslint-disable react/jsx-key */
  return (
    <Table {...getTableProps()}>
      <Thead>
        {headerGroups.map((headerGroup) => (
          <Tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <Th {...column.getHeaderProps(column.getSortByToggleProps())} isNumeric={column.isNumeric}>
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
                <Td {...cell.getCellProps()} isNumeric={cell.column.isNumeric}>
                  {cell.render('Cell')}
                </Td>
              ))}
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
  /* eslint-enable react/jsx-key */
};
