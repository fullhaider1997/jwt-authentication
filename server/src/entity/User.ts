import { Field, ObjectType, Int } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@ObjectType()
//Each field maps into database column
@Entity("users")
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column("text")
  email: string;

  @Field()
  @Column("text")
  password: string;

  @Column("int", { default: 0 })
  tokenVersion: number;
}

