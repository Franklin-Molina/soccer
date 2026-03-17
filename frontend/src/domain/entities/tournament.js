export class Tournament {
  constructor({ 
    id, name, description, startDate, endDate, location, 
    prize, level, format, registrationFee, maxTeams, 
    status, coverImage, registeredTeams, teams, matches, created_at 
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.startDate = startDate;
    this.endDate = endDate;
    this.location = location;
    this.prize = prize;
    this.level = level;
    this.format = format;
    this.registrationFee = registrationFee;
    this.maxTeams = maxTeams;
    this.status = status;
    this.coverImage = coverImage;
    this.registeredTeams = registeredTeams;
    this.teams = teams || [];
    this.matches = matches || [];
    this.createdAt = created_at;
  }
}
