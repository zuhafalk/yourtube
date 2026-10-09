#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1e8412e162dbbe69f4bb3bf8d07f0280ae67eaab15c34dcf201e67468315428d/contract';
import startContract from '../../snapshots/1e8412e162dbbe69f4bb3bf8d07f0280ae67eaab15c34dcf201e67468315428d/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/88ecf11e1a9da9b6b4229c2f5b3f8a3c7f0bccd8d82863cb02332eab2cf1b385/contract';
import endContract from '../../snapshots/88ecf11e1a9da9b6b4229c2f5b3f8a3c7f0bccd8d82863cb02332eab2cf1b385/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  lit,
  placeholder,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropTable({ schema: 'public', table: 'post' }),
      this.dropDefault({ schema: 'public', table: 'user', column: 'id' }),
      this.dropColumn({ schema: 'public', table: 'user', column: 'username' }),
      this.createTable({
        schema: 'public',
        table: 'comment',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('text', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('videoId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'download',
        columns: [
          col('browser', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('deviceModel', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('deviceType', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('downloadedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('errorMessage', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('fileName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('fileSize', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('fileUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('ipAddress', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('plan', 'text', {
            notNull: true,
            default: lit('FREE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('COMPLETED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('userAgent', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('videoId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'like',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('videoId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'subscription',
        columns: [
          col('channelId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('subscriberId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'userPlan',
        columns: [
          col('amount', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('currency', 'text', { default: lit('INR'), codecRef: { codecId: 'pg/text@1' } }),
          col('expiryDate', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('plan', 'text', {
            notNull: true,
            default: lit('FREE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('razorpayOrderId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('razorpayPaymentId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('razorpaySignature', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('renewalDate', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('startDate', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('ACTIVE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'video',
        columns: [
          col('category', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('thumbnail', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('uploaderId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('videoUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('views', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'videoFrame',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('duration', 'int4', {
            notNull: true,
            default: lit(2),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('imageUrl', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('order', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('videoId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'watchHistory',
        columns: [
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('videoId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('watchedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'watchLater',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('videoId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('avatar', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('password', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-user-password', {
        check: () => placeholder('backfill-user-password:check'),
        run: () => placeholder('backfill-user-password:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'user', column: 'password' }),
      this.dataTransform(endContract, 'typechange-user-id', {
        check: () => placeholder('typechange-user-id:check'),
        run: () => placeholder('typechange-user-id:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'user',
        column: 'id',
        options: {
          qualifiedTargetType: 'text',
          formatTypeExpected: 'text',
          rawTargetTypeForLabel: 'text',
        },
      }),
      this.addUnique({
        schema: 'public',
        table: 'comment',
        constraint: 'comment_userId_videoId_key',
        columns: ['userId', 'videoId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'like',
        constraint: 'like_userId_videoId_key',
        columns: ['userId', 'videoId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'subscription',
        constraint: 'subscription_subscriberId_channelId_key',
        columns: ['subscriberId', 'channelId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'userPlan',
        constraint: 'userPlan_userId_key',
        columns: ['userId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'videoFrame',
        constraint: 'videoFrame_videoId_order_key',
        columns: ['videoId', 'order'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'watchHistory',
        constraint: 'watchHistory_userId_videoId_key',
        columns: ['userId', 'videoId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'watchLater',
        constraint: 'watchLater_userId_videoId_key',
        columns: ['userId', 'videoId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'comment',
        index: 'comment_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'comment',
        index: 'comment_videoId_idx_5feac8db',
        columns: ['videoId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'download',
        index: 'download_userId_downloadedAt_idx_9e776fa7',
        columns: ['userId', 'downloadedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'download',
        index: 'download_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'download',
        index: 'download_userId_videoId_idx_7961c470',
        columns: ['userId', 'videoId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'download',
        index: 'download_videoId_downloadedAt_idx_47393879',
        columns: ['videoId', 'downloadedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'download',
        index: 'download_videoId_idx_5feac8db',
        columns: ['videoId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'like',
        index: 'like_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'like',
        index: 'like_videoId_idx_5feac8db',
        columns: ['videoId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'subscription',
        index: 'subscription_channelId_idx_166d3598',
        columns: ['channelId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'subscription',
        index: 'subscription_subscriberId_idx_a7097b83',
        columns: ['subscriberId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'video',
        index: 'video_uploaderId_idx_debae170',
        columns: ['uploaderId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'videoFrame',
        index: 'videoFrame_videoId_idx_5feac8db',
        columns: ['videoId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'watchHistory',
        index: 'watchHistory_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'watchHistory',
        index: 'watchHistory_videoId_idx_5feac8db',
        columns: ['videoId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'watchLater',
        index: 'watchLater_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'watchLater',
        index: 'watchLater_videoId_idx_5feac8db',
        columns: ['videoId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'comment',
        foreignKey: {
          name: 'comment_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'comment',
        foreignKey: {
          name: 'comment_videoId_fkey',
          columns: ['videoId'],
          references: { schema: 'public', table: 'video', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'download',
        foreignKey: {
          name: 'download_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'download',
        foreignKey: {
          name: 'download_videoId_fkey',
          columns: ['videoId'],
          references: { schema: 'public', table: 'video', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'like',
        foreignKey: {
          name: 'like_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'like',
        foreignKey: {
          name: 'like_videoId_fkey',
          columns: ['videoId'],
          references: { schema: 'public', table: 'video', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'subscription',
        foreignKey: {
          name: 'subscription_subscriberId_fkey',
          columns: ['subscriberId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'subscription',
        foreignKey: {
          name: 'subscription_channelId_fkey',
          columns: ['channelId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'userPlan',
        foreignKey: {
          name: 'userPlan_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'video',
        foreignKey: {
          name: 'video_uploaderId_fkey',
          columns: ['uploaderId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'videoFrame',
        foreignKey: {
          name: 'videoFrame_videoId_fkey',
          columns: ['videoId'],
          references: { schema: 'public', table: 'video', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'watchHistory',
        foreignKey: {
          name: 'watchHistory_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'watchHistory',
        foreignKey: {
          name: 'watchHistory_videoId_fkey',
          columns: ['videoId'],
          references: { schema: 'public', table: 'video', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'watchLater',
        foreignKey: {
          name: 'watchLater_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'watchLater',
        foreignKey: {
          name: 'watchLater_videoId_fkey',
          columns: ['videoId'],
          references: { schema: 'public', table: 'video', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
