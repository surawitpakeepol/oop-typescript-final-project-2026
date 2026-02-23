export enum ParticipantStatus {
  REGISTERED = 'REGISTERED',
  CONFIRMED = 'CONFIRMED',
  ATTENDED = 'ATTENDED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED',
}

export class Participant {
  id!: string;
  eventId!: string;
  userId!: string;
  name!: string;
  email!: string;
  phone!: string | null;
  status!: ParticipantStatus;
  registeredAt!: string;
  joinedAt!: string | null;
  notes!: string | null;
  qrCode!: string | null;
  createdAt!: string;
  updatedAt!: string;

  // Mark participant as checked-in/attended
  checkIn(): boolean {
    if (this.status !== ParticipantStatus.CONFIRMED) return false;
    this.status = ParticipantStatus.ATTENDED;
    this.joinedAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    return true;
  }

  // Cancel participation
  cancel(): void {
    this.status = ParticipantStatus.CANCELLED;
    this.updatedAt = new Date().toISOString();
  }

  // Days since registration
  getRegistrationDays(now: Date = new Date()): number {
    const reg = this.registeredAt ? new Date(this.registeredAt) : null;
    if (!reg) return 0;
    const diff = now.getTime() - reg.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
