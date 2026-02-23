import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@ApiTags('event')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body() createEventDto: CreateEventDto) {
    const result = await this.eventService.create(createEventDto);
    return { success: true, message: 'Event created', data: result };
  }

  @Get()
  async findAll() {
    const result = await this.eventService.findAll();
    return { success: true, message: 'OK', data: result };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.eventService.findOne(id);
    return { success: true, message: 'OK', data: result };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    const result = await this.eventService.update(id, updateEventDto);
    return { success: true, message: 'Event updated', data: result };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.eventService.remove(id);
    return { success: true, message: 'Event removed', data: null };
  }
}
