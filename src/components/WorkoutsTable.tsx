// react-table returns the key prop automatically
/* eslint react/jsx-key: 0 */

import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  chakra,
  VisuallyHidden,
} from '@chakra-ui/react';
import { TriangleDownIcon, TriangleUpIcon, StarIcon } from '@chakra-ui/icons';
import { useTable, useSortBy, Column } from 'react-table';
import { Workout } from '@prisma/client';

type Props = {
  workouts: Workout[];
};

const StarRating: React.FC<{ value: number }> = ({ value }) => {
  return (
    <>
      <VisuallyHidden>{value}</VisuallyHidden>
      {[...Array(value)].map((_) => (
        <StarIcon />
      ))}
    </>
  );
};

export const WorkoutsTable: React.FC<Props> = ({ workouts }) => {
  const columns: Array<Column<Workout>> = React.useMemo(
    () => [
      {
        Header: 'Description',
        accessor: 'description',
      },
      { Header: 'Distance (miles)', accessor: 'distance', isNumeric: true },
      { Header: 'Elevation (feet)', accessor: 'elevation', isNumeric: true },
      { Header: 'Pace', accessor: 'pace', isNumeric: true },
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
