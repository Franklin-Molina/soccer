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
  // ... tus métodos anteriores (getTournaments, getTournamentById, enrollTeam, generateFixture)

  async createTournament(tournamentData) {
    try {
      // tournamentData será un objeto FormData enviado desde el frontend
      const response = await api.post('/api/tournaments/', tournamentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Retornamos la nueva entidad mapeada
      return new Tournament(response.data); 
    } catch (error) {
      throw error;
    }
  }

  async updateTournament(id, tournamentData) {
    try {
      // Usamos PATCH por si el admin solo actualiza un texto y no cambia la imagen
      const response = await api.patch(`/api/tournaments/${id}/`, tournamentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return new Tournament(response.data);
    } catch (error) {
      throw error;
    }
  }

  async deleteTournament(id) {
    try {
      const response = await api.delete(`/api/tournaments/${id}/`);
      return response.data; // Normalmente un delete exitoso devuelve 204 No Content
    } catch (error) {
      throw error;
    }
  }
  async updateMatchScore(id, scoreData) {
    try {
      const response = await api.patch(`/api/tournaments/matches/${id}/`, scoreData);
      return response.data; 
    } catch (error) {
      throw error;
    }
  }
}
