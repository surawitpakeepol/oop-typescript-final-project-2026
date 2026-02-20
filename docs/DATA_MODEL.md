# Data Model Documentation - Event Management System

## Overview
เอกสารนี้อธิบายโครงสร้าง Data Model สำหรับระบบจัดการกิจกรรม (Event Management System) ที่ประกอบด้วย 2 Core Models หลัก คือ **Event** และ **Participant**

---

## 1. Event Model

### บทบาท (Purpose)
โมเดล Event แทนกิจกรรมที่จะจัดขึ้น และเก็บข้อมูลรายละเอียดที่เกี่ยวข้องกับกิจกรรม

### Attributes (15 รายการ)

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` (UUID) | ✅ | รหัสประจำตัวกิจกรรมที่ไม่ซ้ำกัน |
| `name` | `string` | ✅ | ชื่อของกิจกรรม (ต้องไม่เว้นว่าง, ≤ 255 characters) |
| `description` | `string` | ✅ | รายละเอียดเต็มของกิจกรรม |
| `status` | `EventStatus` | ✅ | สถานะปัจจุบันของกิจกรรม |
| `category` | `EventCategory` | ✅ | หมวดหมู่ของกิจกรรม |
| `priority` | `EventPriority` | ✅ | ลำดับความสำคัญของกิจกรรม |
| `startDate` | `Date` | ✅ | วันเวลาเริ่มต้นของกิจกรรม |
| `endDate` | `Date` | ✅ | วันเวลาสิ้นสุดของกิจกรรม |
| `location` | `string` | ✅ | สถานที่จัดการ (ชื่อสถาน, ที่อยู่ เป็นต้น) |
| `capacity` | `number` | ✅ | จำนวนที่เข้าร่วมได้สูงสุด (≥ 0) |
| `currentParticipants` | `number` | ✅ | จำนวนผู้เข้าร่วมปัจจุบัน (≤ capacity) |
| `organizer` | `string` | ✅ | ชื่อหรือองค์กรที่จัดการ |
| `registrationDeadline` | `Date` | ✅ | วันหมดเขตการลงทะเบียน |
| `createdAt` | `Date` | ✅ | วันเวลาที่สร้างเรกคอร์ดนี้ (Auto-generated) |
| `updatedAt` | `Date` | ✅ | วันเวลาที่อัปเดตครั้งสุดท้าย (Auto-generated) |

### Constraints & Business Rules

```typescript
// Validation Rules
1. startDate < endDate (วันเริ่มต้นต้องเร็วกว่าวันสิ้นสุด)
2. registrationDeadline ≤ startDate (วันหมดเขตต้องไม่เกินวันเริ่มต้น)
3. capacity > 0 (ต้องมีที่ว่างอย่างน้อย 1 ที่)
4. currentParticipants ≤ capacity (จำนวนประจำตัวไม่ควรเกินความจุ)
5. name ต้องไม่เว้นว่างและไม่นำหน้าด้วยช่องว่าง
```

### Status Transitions (State Machine)

```
DRAFT
  ↓
UPCOMING  →  ONGOING  →  COMPLETED
  ↓            ↓
CANCELLED  CANCELLED
```

---

## 2. Participant Model

### บทบาท (Purpose)
โมเดล Participant แทนบุคคลที่ลงทะเบียนและเข้าร่วมกิจกรรม และเก็บข้อมูลการเข้าร่วม

### Attributes (12 รายการ)

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` (UUID) | ✅ | รหัสประจำตัวของผู้เข้าร่วม |
| `eventId` | `string` (FK) | ✅ | อ้างอิงไปยัง Event ที่ลงทะเบียน |
| `userId` | `string` | ✅ | รหัสผู้ใช้ในระบบ |
| `name` | `string` | ✅ | ชื่อผู้เข้าร่วม (ต้องไม่เว้นว่าง) |
| `email` | `string` | ✅ | อีเมลผู้เข้าร่วม (ควรเป็น valid email format) |
| `phone` | `string \| null` | ❌ | เบอร์โทรศัพท์ติดต่อ (optional) |
| `status` | `ParticipantStatus` | ✅ | สถานะการเข้าร่วมของผู้ใช้ |
| `registeredAt` | `Date` | ✅ | วันเวลาที่ลงทะเบียน |
| `joinedAt` | `Date \| null` | ❌ | วันเวลาที่เข้าร่วมจริง (null ถ้ายังไม่เข้าร่วม) |
| `notes` | `string \| null` | ❌ | หมายเหตุเพิ่มเติม (เช่น ข้อ special request) |
| `qrCode` | `string \| null` | ❌ | รหัส QR สำหรับการย้ืนยันการเข้าร่วม |
| `createdAt` | `Date` | ✅ | วันเวลาที่สร้างเรกคอร์ด (Auto-generated) |
| `updatedAt` | `Date` | ✅ | วันเวลาที่อัปเดตครั้งสุดท้าย (Auto-generated) |

### Constraints & Business Rules

```typescript
// Validation Rules
1. email ต้องเป็น valid email format
2. userId ต้องไม่เว้นว่าง
3. eventId ต้องอ้างอิงไปยัง Event ที่มีในระบบ (Foreign Key)
4. currentParticipants ของ Event ต้องเพิ่มขึ้น 1 เมื่อ Participant ถูกสร้าง
5. joinedAt ต้องเป็น null ถ้า status ≠ ATTENDED
6. ไม่สามารถ register ซ้ำสำหรับ Event เดียวกัน (unique constraint: eventId + userId)
```

### Status Transitions (State Machine)

```
REGISTERED
  ↓
CONFIRMED  →  ATTENDED
  ↓
CANCELLED  ←  NO_SHOW
```

---

## 3. Relationships

### One-to-Many: Event → Participant

```
1 Event has Many Participants
- 1 Event สามารถมีผู้เข้าร่วมหลายคน
- หลาย Participant ใช้ eventId เพื่ออ้างอิงถึง Event เพียงหนึ่งเดียว
- Cardinality: 1:*
- FK: Participant.eventId → Event.id
```

---

## 4. Enums Reference

### EventStatus
```typescript
DRAFT        - ร่างยังไม่เผยแพร่
UPCOMING     - กำลังจะเกิดการจัดการ
ONGOING      - กำลังดำเนินการ
COMPLETED    - เสร็จสิ้นแล้ว
CANCELLED    - ยกเลิก
```

### EventCategory
```typescript
CONFERENCE      - การประชุมใหญ่
WORKSHOP        - สัมมนาไม่เป็นทางการ
SEMINAR         - เซมินาร์เชิงศึกษา
NETWORKING      - สร้างความสัมพันธ์ทางธุรกิจ
TRAINING        - อบรมฝึกอบรม
SOCIAL          - กิจกรรมสังคมสำหรับคนในองค์กร
SPORTS          - กิจกรรมกีฬา
ENTERTAINMENT   - กิจกรรมบันเทิง
OTHER           - อื่น ๆ
```

### EventPriority
```typescript
LOW        - ไม่เร่งด่วน
MEDIUM     - ปานกลาง
HIGH       - สำคัญ
CRITICAL   - วิกฤต
```

### ParticipantStatus
```typescript
REGISTERED  - ลงทะเบียนแล้วแต่ยังไม่ยืนยัน
CONFIRMED   - ยืนยันการเข้าร่วม
ATTENDED    - เข้าร่วมจริง
NO_SHOW     - ไม่มาโดยไม่ยกเลิก
CANCELLED   - ยกเลิกการเข้าร่วม
```

---

## 5. DTO (Data Transfer Objects)

### Event DTOs

#### CreateEventDto (POST Request)
```typescript
{
  name: string;
  description: string;
  category: EventCategory;
  priority: EventPriority;
  startDate: Date;
  endDate: Date;
  location: string;
  capacity: number;
  organizer: string;
  registrationDeadline: Date;
}
```

#### UpdateEventDto (PUT/PATCH Request)
```typescript
{
  name?: string;
  description?: string;
  status?: EventStatus;
  category?: EventCategory;
  priority?: EventPriority;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  capacity?: number;
  organizer?: string;
  registrationDeadline?: Date;
}
```

#### EventResponseDto (Response)
```typescript
{
  id: string;
  name: string;
  description: string;
  status: EventStatus;
  category: EventCategory;
  priority: EventPriority;
  startDate: Date;
  endDate: Date;
  location: string;
  capacity: number;
  currentParticipants: number;
  organizer: string;
  registrationDeadline: Date;
  availableSeats: number; // computed
  createdAt: Date;
  updatedAt: Date;
}
```

### Participant DTOs

#### CreateParticipantDto (POST Request)
```typescript
{
  userId: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}
```

#### UpdateParticipantDto (PUT/PATCH Request)
```typescript
{
  name?: string;
  email?: string;
  phone?: string;
  status?: ParticipantStatus;
  notes?: string;
  joinedAt?: Date;
}
```

#### ParticipantResponseDto (Response)
```typescript
{
  id: string;
  eventId: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  status: ParticipantStatus;
  registeredAt: Date;
  joinedAt: Date | null;
  notes: string | null;
  qrCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 6. Sample Data Examples

### Example Event
```json
{
  "id": "evt_123abc",
  "name": "NestJS Advanced Training",
  "description": "หลักสูตรอบรมเพื่อเรียนรู้เทคนิค NestJS ขั้นสูง",
  "status": "UPCOMING",
  "category": "TRAINING",
  "priority": "HIGH",
  "startDate": "2026-03-15T09:00:00Z",
  "endDate": "2026-03-15T17:00:00Z",
  "location": "Bangkok Convention Hall, Room 201",
  "capacity": 50,
  "currentParticipants": 35,
  "organizer": "Tech Academy Co., Ltd.",
  "registrationDeadline": "2026-03-05T23:59:59Z",
  "createdAt": "2026-02-20T10:00:00Z",
  "updatedAt": "2026-02-21T15:30:00Z"
}
```

### Example Participant
```json
{
  "id": "prt_456def",
  "eventId": "evt_123abc",
  "userId": "usr_789ghi",
  "name": "สมชาย จันทรา",
  "email": "somchai@example.com",
  "phone": "+66812345678",
  "status": "CONFIRMED",
  "registeredAt": "2026-02-21T10:30:00Z",
  "joinedAt": null,
  "notes": "มีความสนใจเป็นพิเศษในหัวข้อ Database Performance",
  "qrCode": "QR_prt_456def_evt_123abc",
  "createdAt": "2026-02-21T10:30:00Z",
  "updatedAt": "2026-02-21T10:30:00Z"
}
```

---

## 7. Implementation Notes

### Type Safety
- ❌ ห้ามใช้ `any` type ทุกกรณี
- ✅ ใช้ `interface` หรือ `type` สำหรับ DTOs
- ✅ ใช้ TypeScript strict mode

### Validation Best Practices
- ใช้ `class-validator` library สำหรับ validation
- ประกาศ decorator ใน DTO class
- ตรวจสอบ business logic ในทั้ง controller และ service

### Data Persistence
- ใช้ JSON file-based storage หรือ in-memory storage
- ต้องมี unique id สำหรับแต่ละ record
- ต้องสนับสนุน CRUD operations
