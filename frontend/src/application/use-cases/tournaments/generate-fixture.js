export class GenerateFixtureUseCase {
  constructor(tournamentRepository) {
    this.tournamentRepository = tournamentRepository;
  }

  async execute(id) {
    return await this.tournamentRepository.generateFixture(id);
  }
}
