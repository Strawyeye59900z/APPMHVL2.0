export enum UserRole {
  ADMIN = 'ADMIN',
  GATE = 'GATE',
  RESIDENT = 'RESIDENT',
}

export enum FacialStatus {
  PENDING = 'PENDING',
  REGISTERED = 'REGISTERED',
}

export enum PackageType {
  BOX = 'BOX',
  ENVELOPE = 'ENVELOPE',
  BAG = 'BAG',
}

export enum SpaceType {
  COURT = 'COURT',
  BBQ = 'BBQ',
  HALL = 'HALL',
}

export enum ReservationStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
}

export interface JwtPayload {
  sub: string;
  role: UserRole;
  apartmentId?: string;
}
