#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/88ecf11e1a9da9b6b4229c2f5b3f8a3c7f0bccd8d82863cb02332eab2cf1b385/contract';
import startContract from '../../snapshots/88ecf11e1a9da9b6b4229c2f5b3f8a3c7f0bccd8d82863cb02332eab2cf1b385/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/eddf67fee17a4b76fc9b6a2bc724ad7913ae8553a5f2c63f06de6e9f40dba0ae/contract';
import endContract from '../../snapshots/eddf67fee17a4b76fc9b6a2bc724ad7913ae8553a5f2c63f06de6e9f40dba0ae/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'comment',
        constraint: 'comment_userId_videoId_key',
      }),
      this.createTable({
        schema: 'public',
        table: 'commentReaction',
        columns: [
          col('commentId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'comment',
        column: col('parentId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'commentReaction',
        constraint: 'commentReaction_userId_commentId_key',
        columns: ['userId', 'commentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'comment',
        index: 'comment_parentId_idx_6a68f597',
        columns: ['parentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'comment',
        index: 'comment_videoId_createdAt_idx_5df18d5b',
        columns: ['videoId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'commentReaction',
        index: 'commentReaction_commentId_idx_b5a4f615',
        columns: ['commentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'commentReaction',
        index: 'commentReaction_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'comment',
        foreignKey: {
          name: 'comment_parentId_fkey',
          columns: ['parentId'],
          references: { schema: 'public', table: 'comment', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'commentReaction',
        foreignKey: {
          name: 'commentReaction_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'commentReaction',
        foreignKey: {
          name: 'commentReaction_commentId_fkey',
          columns: ['commentId'],
          references: { schema: 'public', table: 'comment', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
