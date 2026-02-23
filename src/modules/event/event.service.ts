import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, EventStatus } from './entities/event.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');

function generateId(): string {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

async function readEvents(): Promise<any[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(EVENTS_FILE, 'utf8').catch(() => '[]');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

async function writeEvents(items: any[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(EVENTS_FILE, JSON.stringify(items, null, 2), 'utf8');
}

@Injectable()
export class EventService {
  async create(createEventDto: CreateEventDto) {
    const events = await readEvents();

    // validation rules
    const start = new Date(createEventDto.startDate);
    const end = new Date(createEventDto.endDate);
    const deadline = new Date(createEventDto.registrationDeadline);

    if (!(start < end)) {
      throw new BadRequestException('startDate must be before endDate');
    }
    if (deadline > start) {
      throw new BadRequestException('registrationDeadline must be on or before startDate');
    }
    if (createEventDto.capacity == null || createEventDto.capacity <= 0) {
      throw new BadRequestException('capacity must be > 0');
    }
    if (events.find(e => e.name === createEventDto.name)) {
      throw new BadRequestException('Event name must be unique');
    }

    const now = new Date().toISOString();
    const entity: Event = {
      id: generateId(),
      name: createEventDto.name,
      description: createEventDto.description,
      status: createEventDto.status || EventStatus.UPCOMING,
      category: createEventDto.category,
      priority: createEventDto.priority,
      startDate: createEventDto.startDate,
      endDate: createEventDto.endDate,
      location: createEventDto.location,
      capacity: createEventDto.capacity,
      currentParticipants: 0,
      organizer: createEventDto.organizer,
      registrationDeadline: createEventDto.registrationDeadline,
      createdAt: now,
      updatedAt: now,
      getAvailableSeats() { return Math.max(0, (this.capacity||0) - (this.currentParticipants||0)); },
      isRegistrationOpen(nowDate = new Date()){ if(!this.registrationDeadline) return false; if(this.status === EventStatus.CANCELLED || this.status === EventStatus.COMPLETED) return false; return new Date(this.registrationDeadline) >= nowDate; },
      isEventActive(nowDate = new Date()){ if(!this.startDate || !this.endDate) return false; return new Date(this.startDate) <= nowDate && nowDate <= new Date(this.endDate); },
      addParticipant() { if(this.currentParticipants==null) this.currentParticipants = 0; if(this.capacity!=null && this.currentParticipants >= this.capacity) throw new Error('Event is full'); this.currentParticipants += 1; this.updatedAt = new Date().toISOString(); },
      removeParticipant() { if(this.currentParticipants==null) this.currentParticipants = 0; this.currentParticipants = Math.max(0, this.currentParticipants - 1); this.updatedAt = new Date().toISOString(); },
    } as any;

    events.push(entity);
    await writeEvents(events);
    return entity;
  }

  async findAll() {
    return await readEvents();
  }

  async findOne(id: string) {
    const events = await readEvents();
    const ev = events.find(e => e.id === id);
    if (!ev) throw new NotFoundException('Event not found');
    return ev;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const events = await readEvents();
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) throw new NotFoundException('Event not found');

    const target = events[idx];

    if (updateEventDto.name && events.some(e => e.name === updateEventDto.name && e.id !== id)) {
      throw new BadRequestException('Event name must be unique');
    }

    const merged = { ...target, ...updateEventDto, updatedAt: new Date().toISOString() };

    // validate date constraints if present
    const start = merged.startDate ? new Date(merged.startDate) : null;
    const end = merged.endDate ? new Date(merged.endDate) : null;
    const deadline = merged.registrationDeadline ? new Date(merged.registrationDeadline) : null;

    if (start && end && !(start < end)) {
      throw new BadRequestException('startDate must be before endDate');
    }
    if (deadline && start && deadline > start) {
      throw new BadRequestException('registrationDeadline must be on or before startDate');
    }
    if (merged.capacity != null && merged.capacity <= 0) {
      throw new BadRequestException('capacity must be > 0');
    }

    events[idx] = merged;
    await writeEvents(events);
    return merged;
  }

  async remove(id: string) {
    const events = await readEvents();
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) throw new NotFoundException('Event not found');
    events.splice(idx, 1);
    await writeEvents(events);
    return;
  }
}
