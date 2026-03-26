import React from 'react';
import TournamentTable from '../../Tournaments/TournamentTable.jsx';

const TournamentsManagement = ({
  tournaments,
  loading,
  onDelete,
  onGenerateFixture,
}) => {
  return (
    <TournamentTable
      tournaments={tournaments}
      loading={loading}
      onDelete={onDelete}
      onGenerateFixture={onGenerateFixture}
    />
  );
};

export default TournamentsManagement;
