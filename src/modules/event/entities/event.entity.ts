export enum EventStatus {
  DRAFT = 'DRAFT',
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum EventCategory {
  CONFERENCE = 'CONFERENCE',
  WORKSHOP = 'WORKSHOP',
  SEMINAR = 'SEMINAR',
  NETWORKING = 'NETWORKING',
  TRAINING = 'TRAINING',
  SOCIAL = 'SOCIAL',
  SPORTS = 'SPORTS',
  ENTERTAINMENT = 'ENTERTAINMENT',
  OTHER = 'OTHER',
}

export enum EventPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class Event {
  id!: string;
  name!: string;
  description!: string;
  status!: EventStatus;
  category!: EventCategory;
  priority!: EventPriority;
  startDate!: string;
  endDate!: string;
  location!: string;
  capacity!: number;
  currentParticipants!: number;
  organizer!: string;
  registrationDeadline!: string;
  createdAt!: string;
  updatedAt!: string;

  // Compute available seats
  getAvailableSeats(): number {
    const cap = this.capacity ?? 0;
    const current = this.currentParticipants ?? 0;
    return Math.max(0, cap - current);
  }

  // Check if registration is still open (now <= registrationDeadline and event not cancelled/completed)
  isRegistrationOpen(now: Date = new Date()): boolean {
    if (!this.registrationDeadline) return false;
    if (this.status === EventStatus.CANCELLED || this.status === EventStatus.COMPLETED) return false;
    const deadline = new Date(this.registrationDeadline);
    return now <= deadline;
  }

  // Check if event is currently active (between startDate and endDate)
  isEventActive(now: Date = new Date()): boolean {
    if (!this.startDate || !this.endDate) return false;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    return now >= start && now <= end;
  }

  // Add a participant (increments currentParticipants)
  addParticipant(): void {
    if (this.currentParticipants == null) this.currentParticipants = 0;
    if (this.capacity != null && this.currentParticipants >= this.capacity) {
      throw new Error('Event is full');
    }
    this.currentParticipants += 1;
    this.updatedAt = new Date().toISOString();
  }

  // Remove a participant (decrements currentParticipants)
  removeParticipant(): void {
    if (this.currentParticipants == null) this.currentParticipants = 0;
    this.currentParticipants = Math.max(0, this.currentParticipants - 1);
    this.updatedAt = new Date().toISOString();
  }
}
