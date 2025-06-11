import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import Whatsapp from "./Whatsapp";

@Table
class BaileysChats extends Model<BaileysChats> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @Column
  jid: string;

  @Column(DataType.BIGINT)
  conversationTimestamp: number;

  @Column(DataType.INTEGER)
  unreadCount: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;
}

export default BaileysChats;