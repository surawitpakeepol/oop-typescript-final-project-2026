import { IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';
import { EventCategory, EventPriority } from '../entities/event.entity';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsEnum(EventCategory)
  category!: EventCategory;

  @IsEnum(EventPriority)
  priority!: EventPriority;

  @IsISO8601()
  startDate!: string;

  @IsISO8601()
  endDate!: string;

  @IsNotEmpty()
  @IsString()
  location!: string;

  @IsNumber()
  @Min(1)
  capacity!: number;

  @IsNotEmpty()
  @IsString()
  organizer!: string;

  @IsISO8601()
  registrationDeadline!: string;



}