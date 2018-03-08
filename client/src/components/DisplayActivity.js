// module imports
import React from 'react';
import ReactTable from 'react-table';

// local imports

// style imports

/**
 *
 * @param {object[]} data Activity data
 */
const DisplayActivity = props => {
  const { data } = props;
  console.log(data);
  const columns = [
    {
      Header: 'Station',
      accessor: 'station'
    },
    {
      id: 'correct',
      Header: 'Correct',
      accessor: d => (d.correct ? 'correct' : 'wrong')
    },
    {
      Header: 'Team',
      accessor: 'team'
    },
    {
      id: 'time',
      Header: 'Time',
      accessor: d => d.created_at
    }
  ];

  return (
    <ReactTable
      filterable
      data={data}
      columns={columns}
      className="-striped -highlight"
      defaultFilterMethod={(filter, row) =>
        String(row[filter.id]) === filter.value
      }
    />
  );
};

export default DisplayActivity;
