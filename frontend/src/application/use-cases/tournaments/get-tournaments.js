export class GetTournamentsUseCase {
  constructor(tournamentRepository) {
    this.tournamentRepository = tournamentRepository;
  }

  async execute() {
    return await this.tournamentRepository.getTournaments();
  }
}