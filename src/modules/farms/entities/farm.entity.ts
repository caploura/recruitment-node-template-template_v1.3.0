import { User } from 'modules/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Farm {
  @PrimaryGeneratedColumn('uuid')
  public readonly id: string;

  @Column()
  public name: string;

  @Column()
  public coordinates: string;

  @Column()
  public address: string;

  @ManyToOne(() => User)
  public user: User;

  @Column('decimal', { precision: 6, scale: 2 })
  public size: number;

  @Column('decimal', { precision: 6, scale: 2 })
  public yield: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
