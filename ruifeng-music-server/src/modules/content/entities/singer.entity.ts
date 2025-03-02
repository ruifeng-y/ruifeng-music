import { Entity, PrimaryColumn, Column, BaseEntity } from 'typeorm';

/**
 * 歌手实体
 */
@Entity('singer')
export class SingerEntity extends BaseEntity{
    @PrimaryColumn({ type: 'int', generated: 'increment', comment: '主键'})
    id: number;

    @Column({ type: 'varchar', length: 45, comment: '歌手名字' })
    name: string;

    @Column({ type: 'int', comment: '性别' })
    sex: number;

    @Column({ type: 'varchar', length: 255, comment: '歌手图片' })
    pic: string;

    @Column({ type: 'datetime', comment: '歌手生日' })
    birth: Date;

    @Column({ type: 'varchar',length: 45, comment: '歌手地区' })
    location: string;

    @Column({ type: 'varchar', length: 255, comment: '歌手简介' })
    introduction: string;
    
}