import React from 'react';
import { useTable, Column, Row, useSortBy } from 'react-table';
import { Workout, WorkoutModality } from '@prisma/client';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  chakra,
  useDisclosure,
} from '@chakra-ui/react';
import { TFitbitActivity } from 'lib/queries/fetchFitbitActivities';
import { format, parseISO } from 'date-fns';
import { modalityFromFitbitActivity } from 'lib/utils/fitbitUtils';
import { formatDurationFromMs, getMphToMinutesStr } from 'lib/utils/units';
import {
  AddIcon,
  CheckIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from '@chakra-ui/icons';
import { AddFitbitWorkoutModal } from './AddFitbitWorkoutModal';

/**
 * The parsed API data gets passed as props
 */
type Props = {
  fitbitActivities: TFitbitActivity[];
};

/**
 * Displays table view of the given workouts
 * @param workouts Array of workouts
 * @returns
 */
export const FitbitWorkoutsTable: React.FC<Props> = ({ fitbitActivities }) => {
  const showAddWorkoutModal = useDisclosure();

  const [importRow, setImportRow] = React.useState<TFitbitActivity>();

  /**
   * Define the columns for the table
   */
  const columns: Array<Column<TFitbitActivity>> = React.useMemo(
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
        accessor: 'activityName',
        Cell: ({ value }) => {
          const modality = modalityFromFitbitActivity(value);
          const colorScheme = modality === 'RUN' ? 'green' : 'yellow';
          return (
            <Badge variant="solid" colorScheme={colorScheme}>
              {modality}
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
        accessor: 'elevationGain',
        isNumeric: true,
        Cell: ({ value }) =>
          value
            ? `${(Math.round(value * 10) / 10).toLocaleString('en-US')}`
            : '',
      },
      {
        Header: 'Pace',
        accessor: 'speed',
        isNumeric: true,
        Cell: ({ value }) => (value ? getMphToMinutesStr(value) : ''),
      },
      {
        Header: 'Avg Heart Rate',
        accessor: 'averageHeartRate',
        isNumeric: true,
      },
      {
        Header: 'Duration',
        accessor: 'activeDuration',
        isNumeric: true,
        Cell: ({ value }) => formatDurationFromMs(value),
      },
    ],
    []
  );

  const { getTableBodyProps, getTableProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: fitbitActivities,
      },
      useSortBy,
      (hooks) => {
        hooks.visibleColumns.push((columns) => [
          {
            Header: 'Import',
            accessor: 'logId',
            Cell: ({ row }) => (
              <IconButton
                aria-label="Delete row"
                size="sm"
                variant={row.original?.isImported ? 'ghost' : 'outline'}
                disabled={row.original?.isImported}
                icon={
                  row.original?.isImported ? (
                    <CheckIcon color="green.500" />
                  ) : (
                    <AddIcon />
                  )
                }
                onClick={() => {
                  setImportRow(row.original);
                  showAddWorkoutModal.onOpen();
                }}
              />
            ),
            disableSortBy: false,
          },
          ...columns,
        ]);
      }
    );

  // react-table returns the key prop automatically
  /* eslint-disable react/jsx-key */
  return (
    <>
      <Table {...getTableProps()}>
        <Thead>
          {headerGroups.map((headerGroup) => (
            <Tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <Th
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
      <AddFitbitWorkoutModal
        fitbitActivity={importRow}
        modalDisclosure={showAddWorkoutModal}
      />
    </>
  );
  /* eslint-enable react/jsx-key */
};
