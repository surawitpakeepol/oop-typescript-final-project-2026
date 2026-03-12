import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PARTICIPANTS_FILE = path.join(DATA_DIR, 'participants.json');

function generateId(): string {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

async function readParticipants(): Promise<any[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(PARTICIPANTS_FILE, 'utf8').catch(() => '[]');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

async function writeParticipants(items: any[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PARTICIPANTS_FILE, JSON.stringify(items, null, 2), 'utf8');
}

@Injectable()
export class ParticipantService {

  async create(createParticipantDto: CreateParticipantDto) {
    const participants = await readParticipants();

    if (!createParticipantDto.name) {
      throw new BadRequestException('name is required');
    }

    if (!createParticipantDto.email) {
      throw new BadRequestException('email is required');
    }

    if (participants.find(p => p.email === createParticipantDto.email)) {
      throw new BadRequestException('Email must be unique');
    }

    const now = new Date().toISOString();

    const entity = {
      id: generateId(),
      ...createParticipantDto,
      createdAt: now,
      updatedAt: now,
    };

    participants.push(entity);
    await writeParticipants(participants);

    return entity;
  }

  async findAll() {
    return await readParticipants();
  }

  async findOne(id: string) {
    const participants = await readParticipants();
    const participant = participants.find(p => p.id === id);

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    return participant;
  }

  async update(id: string, updateParticipantDto: UpdateParticipantDto) {
    const participants = await readParticipants();
    const index = participants.findIndex(p => p.id === id);

    if (index === -1) {
      throw new NotFoundException('Participant not found');
    }

    if (
      updateParticipantDto.email &&
      participants.some(p => p.email === updateParticipantDto.email && p.id !== id)
    ) {
      throw new BadRequestException('Email must be unique');
    }

    const updated = {
      ...participants[index],
      ...updateParticipantDto,
      updatedAt: new Date().toISOString(),
    };

    participants[index] = updated;

    await writeParticipants(participants);

    return updated;
  }

  async remove(id: string) {
    const participants = await readParticipants();
    const index = participants.findIndex(p => p.id === id);

    if (index === -1) {
      throw new NotFoundException('Participant not found');
    }

    participants.splice(index, 1);
    await writeParticipants(participants);

    return;
  }
}