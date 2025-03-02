import {
    Entity, PrimaryColumn, Column, BaseEntity
} from 'typeorm';

/**
 * 歌曲实体类
 */
@Entity('song')
export class SongEntity extends BaseEntity{
  @PrimaryColumn({ type: 'int', generated: 'increment', comment: '主键'})
  id?: string;

  @Column({ name: 'singer_id',type: 'int', comment: '歌手名字' })
  singerId?: number;

  @Column({ type: 'varchar', length: 45, comment: '歌曲名字' })
  name?: string;

  @Column({ type: 'varchar', length: 255, comment: '介绍' })
  introduction?: string;

  @Column({name: 'create_time', type: 'datetime', comment: '创建时间' })
  createTime?: number;

  @Column({name: 'update_time', type: 'datetime', comment: '更新时间' })
  updateTime?: string;

  @Column({ type: 'varchar', length: 255, comment: '歌曲时长' })
  pic?: number;

  @Column({ type: 'text', comment: '歌词' })
  lyric?: string;

  @Column({ type: 'varchar', length: 255, comment: '歌曲地址' })
  url?: string;
}