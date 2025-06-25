import {
  pgTable,
  text,
  uuid,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Basic File/Folder information
  name: text("name").notNull(),
  path: text("path").notNull(), // /document/project/resume
  size: integer("size").notNull(),
  type: text("type").notNull(), // For eg. type = folder

  // Storage Information
  fileUrl: text("file_url").notNull(), // url to access the file
  thumbnailUrl: text("thumbnail_url"),

  //Ownership Information
  userId: text("user_id").notNull(),
  parentId: uuid("parent_id"), // Parent folder id (null for root items)

  // File/Folder Flags
  isFolder: boolean("is_folder").default(false).notNull(),
  isStarred: boolean("is_starred").default(false).notNull(),
  isTrash: boolean("is_trash").default(false).notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/*
    parent: Each file/folder can have one parent folder
    children: Each folder can have many child files.folder
    */

export const filesRelations = relations(files, ({ one, many }) => ({
  // relationship to child file/folder - There could be many files inside the folder
  parent: one(files, {
    fields: [files.parentId],
    references: [files.id],
  }),
  children: many(files),
}));

// Type definitions

export const File = typeof files.$inferSelect;
export const NewFile = typeof files.$inferInsert;
