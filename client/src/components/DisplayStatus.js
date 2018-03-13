// module imports
import React from 'react';
import ReactTable from 'react-table';

// local imports

// style imports

/**
 *
 * @param {object[]} data Status data
 */
const DisplayStatus = props => {
  const { data } = props;
  console.log(data);
  const columns = [
    {
      Header: 'Team',
      accessor: 'team'
    },
    {
      Header: 'Last Station Number',
      accessor: 'lastStationNumber'
    },
    {
      Header: 'Last Station Question',
      accessor: 'lastStationQuestion',
      Cell: row => <div style={{ whiteSpace: 'normal' }}>{row.value}</div>
    },
    {
      Header: 'Next Station Number',
      accessor: 'nextStationNumber'
    },
    {
      Header: 'Next Station Question',
      accessor: 'nextStationQuestion',
      Cell: row => <div style={{ whiteSpace: 'normal' }}>{row.value}</div>
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

export default DisplayStatus;
