import { PartialType } from '@nestjs/mapped-types';
import { CreateParticipantDto } from './create-participant.dto';
import { IsOptional, IsString, IsEmail } from 'class-validator';
import { ParticipantStatus } from '../entities/participant.entity';

export class UpdateParticipantDto extends PartialType(CreateParticipantDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  status?: ParticipantStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  joinedAt?: string;
}
