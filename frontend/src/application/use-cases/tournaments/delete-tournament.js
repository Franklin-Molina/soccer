export class DeleteTournamentUseCase {
  constructor(tournamentRepository) {
    this.tournamentRepository = tournamentRepository;
  }

  async execute(id) {
    return await this.tournamentRepository.deleteTournament(id);
  }
}