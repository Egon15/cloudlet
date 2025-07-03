import {
  pgTable,
  text,
  uuid,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

//Files table - stores both files and folders with hierarchy support.
export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Basic metadata
  name: text("name").notNull(),
  path: text("path").notNull(), // Full virtual path e.g. /documents/project
  size: integer("size").notNull(),
  type: text("type").notNull(), // E.g., "folder", "image/png"

  // File storage
  fileUrl: text("file_url").notNull(), // Actual file URL
  thumbnailUrl: text("thumbnail_url"), // Optional preview image

  // Ownership and hierarchy
  userId: text("user_id").notNull(),
  parentId: uuid("parent_id"), // Null for root folders

  // Flags
  isFolder: boolean("is_folder").default(false).notNull(),
  isStarred: boolean("is_starred").default(false).notNull(),
  isTrash: boolean("is_trash").default(false).notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

//Define self-referencing relationships for parent-child folders/files.
export const filesRelations = relations(files, ({ one, many }) => ({
  parent: one(files, {
    fields: [files.parentId],
    references: [files.id],
  }),
  children: many(files),
}));

//Type exports
export type FileType = typeof files.$inferSelect;
export type NewFileType = typeof files.$inferInsert;
