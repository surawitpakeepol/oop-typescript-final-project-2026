import { Module } from '@nestjs/common';
import { EventModule } from './modules/event/event.module';
import { ParticipantModule } from './modules/participant/participant.module';

@Module({
  imports: [EventModule, ParticipantModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
