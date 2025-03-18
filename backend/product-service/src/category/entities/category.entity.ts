import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('Categories')
export class Categories {
    @PrimaryColumn()
    CategoryID: number;

    @Column()
    CategoryName: string;

    @Column({ nullable: true })
    ParentID: number;
}
