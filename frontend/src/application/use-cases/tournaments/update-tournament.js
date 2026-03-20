export class UpdateTournamentUseCase {
  constructor(tournamentRepository) {
    this.tournamentRepository = tournamentRepository;
  }

  async execute(id, tournamentData) {
    return await this.tournamentRepository.updateTournament(id, tournamentData);
  }
}