import { FC } from 'react';

import { Col, Row } from 'antd';

import $styles from './grid-column.module.css';

export const GridColumn: FC = () => {

  return (
    <div className={$styles.ss}>
      {/* <ul className={$styles.ul}>
        <li>
        <div className={$styles.d2}>
          <img src="https://picsum.photos/600/350?v=1" 
          alt="Example Image" 
          className={$styles.d3} />
        </div>
        </li>
        <li>
        <div className={$styles.d2}>
          <img src="https://picsum.photos/600/350?v=1" 
          alt="Example Image" 
          className={$styles.d3} />
        </div>
        </li>

        <li>
        <div className={$styles.d2}>
          <img src="https://picsum.photos/600/350?v=1" 
          alt="Example Image" 
          className={$styles.d3} />
        </div>
        </li>

        <li>
        <div className={$styles.d2}>
          <img src="https://picsum.photos/600/350?v=1" 
          alt="Example Image" 
          className={$styles.d3} />
        </div>
        </li>
      </ul> */}

      <div className={$styles.title}>title</div>
      <Row gutter={16}>
        <Col span="4">
        <div className={$styles.d2}>
          <img src="https://picsum.photos/600/350?v=1" 
          alt="Example Image" 
          className={$styles.d3} />
        </div>
          <span className={$styles.song_list_name}>歌单名</span>
        </Col>
        <Col span="4">
        <div className={$styles.d2}>
          <img src="https://picsum.photos/600/350?v=1" 
          alt="Example Image" 
          className={$styles.d3} />
        </div>
          <span className={$styles.song_list_name}>歌单名</span>
        </Col>
        <Col span="4">
        <div className={$styles.d2}>
          <img src="https://picsum.photos/600/350?v=1" 
          alt="Example Image" 
          className={$styles.d3} />
        </div>
          <span className={$styles.song_list_name}>歌单名</span>
        </Col>

        <Col span="4">
        <div className={$styles.d2}>
          <img src="https://picsum.photos/600/350?v=1" 
          alt="Example Image" 
          className={$styles.d3} />
        </div>
          <span className={$styles.song_list_name}>歌单名</span>
        </Col>

        <Col span="4">
        <div className={$styles.d2}>
          <img src="https://picsum.photos/600/350?v=1" 
          alt="Example Image" 
          className={$styles.d3} />
        </div>
          <span className={$styles.song_list_name}>歌单名</span>
        </Col>

        <Col span="4">
        <div className={$styles.d2}>
          <img src="https://picsum.photos/600/350?v=1" 
          alt="Example Image" 
          className={$styles.d3} />
        </div>
          <span className={$styles.song_list_name}>歌单名</span>
        </Col>
      </Row>


      {/* <div className={$styles.d1}>
        <div className={$styles.d2}>
          <img src="https://picsum.photos/600/350?v=1" 
          alt="Example Image" 
          className={$styles.d3} />
        </div>
      </div> */}

    </div>
  )
}

