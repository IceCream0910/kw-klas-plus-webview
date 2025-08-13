import React from 'react';
import Spacer from './spacer';

const TodaysCafeteriaMenu = ({ data }) => {
  if (!data || !data.restaurants) return null;

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const todaysMenus = data.restaurants.map(restaurant => {
    const todayMenu = restaurant.weeklyMenu.find(item => item.date === today || item.day === now.toLocaleDateString('ko-KR', { weekday: 'long' }));
    return {
      ...restaurant,
      todayMenu
    };
  }).filter(restaurant => restaurant.todayMenu);

  if (todaysMenus.length === 0) {
    return <div>
      <p style={{ marginBottom: '20px', marginTop: '-5px', fontSize: '15px', opacity: .5 }}>오늘의 학식 정보가 없습니다.</p>
    </div>;
  }

  const formatMenu = (menuString) => {
    if (!menuString) return [];
    return menuString.split('\r\n').filter(item => item.trim() !== '');
  };

  return (
    <div style={{ marginTop: '-5px' }}>
      {todaysMenus.map((restaurant, index) => (
        <div key={index}>
          <h5>{restaurant.name}</h5>
          <span style={{ fontSize: '13px', opacity: .4 }}>
            {restaurant.price} • {restaurant.time}</span>
          <Spacer y={10} />

          {formatMenu(restaurant.todayMenu.menu).map((item, idx) => (
            <span style={{ opacity: .6 }}>{item}{idx < formatMenu(restaurant.todayMenu.menu).length - 1 && ", "}</span>
          ))}

          <Spacer y={10} />
          {index < todaysMenus.length - 1 && <hr style={{ opacity: 0.3, margin: '10px 0 20px 0' }} />}
        </div >
      ))
      }

      <Spacer y={10} />
    </div >
  );
};

export default TodaysCafeteriaMenu;