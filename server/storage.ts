import { schedules, scheduleProgress, type Schedule, type InsertSchedule, type ScheduleProgress, type InsertScheduleProgress, users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  getSchedule(scheduleId: string): Promise<Schedule | undefined>;
  updateScheduleProgress(progress: InsertScheduleProgress): Promise<ScheduleProgress>;
  getScheduleProgress(scheduleId: string): Promise<ScheduleProgress[]>;
  deleteScheduleProgress(scheduleId: string, taskId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const [schedule] = await db
      .insert(schedules)
      .values(insertSchedule)
      .returning();
    return schedule;
  }

  async getSchedule(scheduleId: string): Promise<Schedule | undefined> {
    const [schedule] = await db.select().from(schedules).where(eq(schedules.scheduleId, scheduleId));
    return schedule || undefined;
  }

  async updateScheduleProgress(insertProgress: InsertScheduleProgress): Promise<ScheduleProgress> {
    // Check if progress already exists
    const [existing] = await db
      .select()
      .from(scheduleProgress)
      .where(eq(scheduleProgress.scheduleId, insertProgress.scheduleId))
      .where(eq(scheduleProgress.taskId, insertProgress.taskId));

    if (existing) {
      // Update existing progress
      const [updated] = await db
        .update(scheduleProgress)
        .set({
          completed: insertProgress.completed,
          completedAt: insertProgress.completed ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(scheduleProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new progress entry
      const [newProgress] = await db
        .insert(scheduleProgress)
        .values({
          ...insertProgress,
          completedAt: insertProgress.completed ? new Date() : null,
        })
        .returning();
      return newProgress;
    }
  }

  async getScheduleProgress(scheduleId: string): Promise<ScheduleProgress[]> {
    return await db
      .select()
      .from(scheduleProgress)
      .where(eq(scheduleProgress.scheduleId, scheduleId));
  }

  async deleteScheduleProgress(scheduleId: string, taskId: string): Promise<void> {
    await db
      .delete(scheduleProgress)
      .where(eq(scheduleProgress.scheduleId, scheduleId))
      .where(eq(scheduleProgress.taskId, taskId));
  }
}

export const storage = new DatabaseStorage();
