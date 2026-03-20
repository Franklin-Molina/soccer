export class EnrollTeamUseCase {
  constructor(tournamentRepository) {
    this.tournamentRepository = tournamentRepository;
  }

  async execute(id, teamName) {
    return await this.tournamentRepository.enrollTeam(id, teamName);
  }
}
