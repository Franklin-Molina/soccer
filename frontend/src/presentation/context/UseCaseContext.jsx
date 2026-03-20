import React, { createContext, useContext } from 'react';
import { useRepositories } from './RepositoryContext';
import { GetBookingsUseCase } from '../../application/use-cases/bookings/get-bookings';
import { CreateBookingUseCase } from '../../application/use-cases/bookings/create-booking';
import { DeleteBookingUseCase } from '../../application/use-cases/bookings/delete-booking';
import { GetUserListUseCase } from '../../application/use-cases/users/get-user-list';
import { DeleteUserUseCase } from '../../application/use-cases/users/delete-user';
import { GetCourtByIdUseCase } from '../../application/use-cases/courts/get-court-by-id';
import { CheckAvailabilityUseCase } from '../../application/use-cases/courts/check-availability';
import { GetWeeklyAvailabilityUseCase } from '../../application/use-cases/courts/get-weekly-availability';
import { UpdateCourtUseCase } from '../../application/use-cases/courts/update-court'; // Importar UpdateCourtUseCase

import { GetTournamentsUseCase } from '../../application/use-cases/tournaments/get-tournaments';
import { GetTournamentByIdUseCase } from '../../application/use-cases/tournaments/get-tournament-by-id';
import { CreateTournamentUseCase } from '../../application/use-cases/tournaments/create-tournament';
import { UpdateTournamentUseCase } from '../../application/use-cases/tournaments/update-tournament';
import { DeleteTournamentUseCase } from '../../application/use-cases/tournaments/delete-tournament';
import { GenerateFixtureUseCase } from '../../application/use-cases/tournaments/generate-fixture';
import { EnrollTeamUseCase } from '../../application/use-cases/tournaments/enroll-team';

import { UpdateMatchScoreUseCase } from '../../application/use-cases/tournaments/update-match-score'
// Importar otros casos de uso aquí si es necesario

// Crear el contexto para los casos de uso
const UseCaseContext = createContext(null);

/**
 * Proveedor de casos de uso para la aplicación.
 * Envuelve la aplicación y proporciona instancias de casos de uso a los componentes hijos.
 * @param {object} { children } - Los componentes hijos que tendrán acceso a los casos de uso.
 */
export const UseCaseProvider = ({ children }) => {
  const { bookingRepository, userRepository, courtRepository, tournamentRepository } = useRepositories();

  // Instanciar los casos de uso aquí, inyectando las dependencias de los repositorios
  const getBookingsUseCase = new GetBookingsUseCase(bookingRepository);
  const getUserListUseCase = new GetUserListUseCase(userRepository);
  const deleteUserUseCase = new DeleteUserUseCase(userRepository);
  const getCourtByIdUseCase = new GetCourtByIdUseCase(courtRepository);
  const checkAvailabilityUseCase = new CheckAvailabilityUseCase(courtRepository);
  const getWeeklyAvailabilityUseCase = new GetWeeklyAvailabilityUseCase(courtRepository);
  const createBookingUseCase = new CreateBookingUseCase(bookingRepository);
  const deleteBookingUseCase = new DeleteBookingUseCase(bookingRepository);
  const updateCourtUseCase = new UpdateCourtUseCase(courtRepository); // Instanciar UpdateCourtUseCase
  const getTournamentsUseCase = new GetTournamentsUseCase(tournamentRepository);
  const getTournamentByIdUseCase = new GetTournamentByIdUseCase(tournamentRepository);
  const createTournamentUseCase = new CreateTournamentUseCase(tournamentRepository);
  const updateTournamentUseCase = new UpdateTournamentUseCase(tournamentRepository);
  const deleteTournamentUseCase = new DeleteTournamentUseCase(tournamentRepository);
  const generateFixtureUseCase = new GenerateFixtureUseCase(tournamentRepository);
  const enrollTeamUseCase = new EnrollTeamUseCase(tournamentRepository);
  const updateMatchScoreUseCase = new UpdateMatchScoreUseCase(tournamentRepository);
  
  // Añadir otros casos de uso aquí

  const useCases = {
    getBookingsUseCase,
    deleteBookingUseCase,
    getUserListUseCase,
    deleteUserUseCase,
    getCourtByIdUseCase,
    checkAvailabilityUseCase,
    getWeeklyAvailabilityUseCase,
    createBookingUseCase,
    updateCourtUseCase,    
    getTournamentsUseCase,
    getTournamentByIdUseCase,
    createTournamentUseCase,
    updateTournamentUseCase,
    deleteTournamentUseCase,
    generateFixtureUseCase,
    enrollTeamUseCase,
    updateMatchScoreUseCase // Añadir generateFixtureUseCase al objeto
    // Añadir otros casos de uso aquí
  };

  return (
    <UseCaseContext.Provider value={useCases}>
      {children}
    </UseCaseContext.Provider>
  );
};

/**
 * Hook personalizado para acceder a los casos de uso.
 * @returns {object} Un objeto que contiene las instancias de los casos de uso.
 */
export const useUseCases = () => {
  const context = useContext(UseCaseContext);
  if (!context) {
    throw new Error('useUseCases debe ser usado dentro de un UseCaseProvider');
  }
  return context;
};
