/**
 * Interfaz que define el contrato para un repositorio de torneos.
 */
export class ITournamentRepository {
  /**
   * Obtiene una lista de todos los torneos.
   * @returns {Promise<Tournament[]>}
   */
  async getTournaments() {
    throw new Error('Method not implemented.');
  }

  /**
   * Obtiene los detalles de un torneo específico por su ID.
   * @param {number|string} id - El ID del torneo.
   * @returns {Promise<Tournament>}
   */
  async getTournamentById(id) {
    throw new Error('Method not implemented.');
  }

  /**
   * Inscribe un equipo en un torneo.
   * @param {number|string} id - El ID del torneo.
   * @param {string} teamName - El nombre del equipo.
   * @returns {Promise<object>}
   */
  async enrollTeam(id, teamName) {
    throw new Error('Method not implemented.');
  }

  /**
   * Genera el fixture del torneo.
   * @param {number|string} id - El ID del torneo.
   * @returns {Promise<object>}
   */
  async generateFixture(id) {
    throw new Error('Method not implemented.');
  }
}
