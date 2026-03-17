import api from '../api/api.js';
import { ITournamentRepository } from '../../domain/repositories/tournament-repository';
import { Tournament } from '../../domain/entities/tournament';

export class ApiTournamentRepository extends ITournamentRepository {
  async getTournaments() {
    try {
      const response = await api.get('/api/tournaments/');
      return response.data.map(data => new Tournament(data));
    } catch (error) {
      throw error;
    }
  }

  async getTournamentById(id) {
    try {
      const response = await api.get(`/api/tournaments/${id}/`);
      return new Tournament(response.data);
    } catch (error) {
      throw error;
    }
  }

  async enrollTeam(id, teamName) {
    try {
      const response = await api.post(`/api/tournaments/${id}/enroll/`, {
        team_name: teamName
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async generateFixture(id) {
    try {
      const response = await api.post(`/api/tournaments/${id}/generate_fixture/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
