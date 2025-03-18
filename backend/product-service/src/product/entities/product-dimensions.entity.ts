import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('ProductDimensions')
export class ProductDimensions {
  @PrimaryGeneratedColumn()
  ProductDimensionsID: number;

  @Column('decimal')
  Weight: number;

  @Column('decimal')
  Length: number;

  @Column('decimal')
  Width: number;

  @Column('decimal')
  Height: number;
}