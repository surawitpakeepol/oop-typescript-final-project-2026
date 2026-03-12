```mermaid
classDiagram

class Event {
  -String id
  -String name
  -String description
  -EventStatus status
  -EventCategory category
  -EventPriority priority
  -Date startDate
  -Date endDate
  -String location
  -Number capacity
  -Number currentParticipants
  -String organizer
  -Date registrationDeadline
  -Date createdAt
  -Date updatedAt

  +Number getAvailableSeats()
  +Boolean isRegistrationOpen()
  +Boolean isEventActive()
  +void addParticipant()
  +void removeParticipant()
}

class Participant {
  -String id
  -String eventId
  -String userId
  -String name
  -String email
  -String phone
  -ParticipantStatus status
  -Date registeredAt
  -Date joinedAt
  -String notes
  -String qrCode
  -Date createdAt
  -Date updatedAt

  +Boolean checkIn()
  +void cancel()
  +Number getRegistrationDays()
}

class EventStatus {
<<enumeration>>
DRAFT
UPCOMING
ONGOING
COMPLETED
CANCELLED
}

class EventCategory {
<<enumeration>>
CONFERENCE
WORKSHOP
SEMINAR
NETWORKING
TRAINING
SOCIAL
SPORTS
ENTERTAINMENT
OTHER
}

class EventPriority {
<<enumeration>>
LOW
MEDIUM
HIGH
CRITICAL
}

class ParticipantStatus {
<<enumeration>>
REGISTERED
CONFIRMED
ATTENDED
NO_SHOW
CANCELLED
}

Event "1" --> "*" Participant
Event --> EventStatus
Event --> EventCategory
Event --> EventPriority
Participant --> ParticipantStatus
```S