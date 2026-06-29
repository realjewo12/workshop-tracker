import Dexie from 'dexie';

const db = new Dexie('WorkshopTrackerDB');

db.version(1).stores({
  users: '++id, fullName, workshopName, phoneNumber, email, workshopType, password, createdAt',
});

export default db;