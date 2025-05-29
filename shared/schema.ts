import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  scheduleId: text("schedule_id").notNull().unique(),
  activities: json("activities").$type<Activity[]>().notNull(),
  selfCareResponses: json("self_care_responses").$type<Record<string, any>>().notNull(),
  startTime: text("start_time").notNull(),
  totalDuration: integer("total_duration").notNull(),
  phoneNumber: text("phone_number"),
  notificationsEnabled: boolean("notifications_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scheduleProgress = pgTable("schedule_progress", {
  id: serial("id").primaryKey(),
  scheduleId: text("schedule_id").notNull(),
  taskId: text("task_id").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export interface Activity {
  id: string;
  activity: string;
  label: string;
  time: number;
  icon: string;
  custom?: boolean;
  startTime?: string;
  endTime?: string;
}

export interface SelfCareResponse {
  meTimeType?: string;
  feeling?: string;
  wellness?: string[];
}

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
  createdAt: true,
});

export const insertScheduleProgressSchema = createInsertSchema(scheduleProgress).omit({
  id: true,
  updatedAt: true,
});

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;
export type InsertScheduleProgress = z.infer<typeof insertScheduleProgressSchema>;
export type ScheduleProgress = typeof scheduleProgress.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
