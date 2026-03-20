export class UpdateMatchScoreUseCase {
  constructor(tournamentRepository) {
    this.tournamentRepository = tournamentRepository;
  }

  // Recibe el ID del partido y los datos (goles y si finalizó)
  async execute(matchId, scoreData) {
    return await this.tournamentRepository.updateMatchScore(matchId, scoreData);
  }
}