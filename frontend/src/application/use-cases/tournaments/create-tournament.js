export class CreateTournamentUseCase {
  constructor(tournamentRepository) {
    this.tournamentRepository = tournamentRepository;
  }

  async execute(tournamentData) {
    return await this.tournamentRepository.createTournament(tournamentData);
  }
}