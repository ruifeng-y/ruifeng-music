
import {
    Entity, PrimaryColumn, Column, BaseEntity
} from 'typeorm';

/**
 * 歌单实体
 */
@Entity('song_list')
export class SongListEntity extends BaseEntity {
    @PrimaryColumn({ type: 'int', generated: 'increment', comment: '主键'})
    id: number;

    @Column({ comment: '标题'})
    title: string;

    @Column({ comment: '封面'})
    pic: string;
    
    @Column({ comment: '简介'})
    introduction: string;

    @Column({ comment: '风格'})
    style: string;

}