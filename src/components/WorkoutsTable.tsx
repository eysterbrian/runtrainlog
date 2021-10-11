import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  chakra,
  VisuallyHidden,
} from '@chakra-ui/react';
import { TriangleDownIcon, TriangleUpIcon, StarIcon } from '@chakra-ui/icons';
import { useTable, useSortBy, Column } from 'react-table';
import { Workout } from '@prisma/client';
import { parseISO, format, addSeconds } from 'date-fns';

type Props = {
  workouts: Workout[];
};

const StarRating: React.FC<{ value: number }> = ({ value }) => {
  return (
    <chakra.span whiteSpace="nowrap">
      <VisuallyHidden>{value}</VisuallyHidden>
      {[...Array(value)].map((_, idx) => (
        <StarIcon key={idx} />
      ))}
    </chakra.span>
  );
};

export const WorkoutsTable: React.FC<Props> = ({ workouts }) => {
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
        Cell: StarRating,
      },
      {
        Header: 'Difficulty',
        accessor: 'ratingDifficulty',
        isNumeric: true,
        Cell: StarRating,
      },
      {
        Header: 'General',
        accessor: 'ratingGeneral',
        isNumeric: true,
        Cell: StarRating,
      },
    ],
    []
  );
  const data = React.useMemo<Workout[]>(() => workouts, [workouts]);

  const { getTableBodyProps, getTableProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: workouts }, useSortBy);

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
    </>
  );
};
/* eslint-enable react/jsx-key */
