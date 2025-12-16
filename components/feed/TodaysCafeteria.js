import React from 'react';
import Spacer from '../common/spacer';

const TodaysCafeteriaMenu = ({ data }) => {
  if (!data || !data.restaurants) return null;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayWeekday = now.toLocaleDateString('ko-KR', { weekday: 'long' });
  const isClosed = now.getHours() >= 14;
  const hasTodayData = data.restaurants.some(r => Array.isArray(r.weeklyMenu) && r.weeklyMenu.some(i => i && i.date === todayStr));
  if (!hasTodayData) {
    return (
      <div>
        <p style={{ marginBottom: '20px', marginTop: '-5px', fontSize: '15px', opacity: .5 }}>학식 정보가 없습니다.</p>
      </div>
    );
  }


  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  const tomorrowWeekday = tomorrow.toLocaleDateString('ko-KR', { weekday: 'long' });

  const resolveMenuForRestaurant = (restaurant) => {
    const weekly = Array.isArray(restaurant.weeklyMenu) ? restaurant.weeklyMenu : [];

    const todayItem = weekly.find(item => item.date === todayStr || item.day === todayWeekday);
    const tomorrowItem = weekly.find(item => item.date === tomorrowStr || item.day === tomorrowWeekday);

    if (isClosed) {
      if (tomorrowItem) return { ...restaurant, pickedMenu: { ...tomorrowItem, isTomorrow: true } };
      if (todayItem) return { ...restaurant, pickedMenu: { ...todayItem, isTomorrow: false } };
      return { ...restaurant, pickedMenu: null };
    }

    if (todayItem) return { ...restaurant, pickedMenu: { ...todayItem, isTomorrow: false } };
    return { ...restaurant, pickedMenu: null };
  };

  const menus = data.restaurants.map(resolveMenuForRestaurant).filter(r => r.pickedMenu);

  const hasTomorrowData = data.restaurants.some(r => Array.isArray(r.weeklyMenu) && r.weeklyMenu.some(i => i && (i.date === tomorrowStr || i.day === tomorrowWeekday)));
  const headerNote = isClosed ? (hasTomorrowData ? '오늘 학식은 종료되었어요. 내일 식단을 보여드릴게요.' : '오늘 학식은 종료되었어요.') : null;

  if (menus.length === 0) {
    return (
      <div>
        <p style={{ marginBottom: '20px', marginTop: '-5px', fontSize: '15px', opacity: .5 }}>학식 정보가 없습니다.</p>
      </div>
    );
  }

  const formatMenu = (menuString) => {
    if (!menuString) return [];
    return menuString.split('\r\n').filter(item => item.trim() !== '');
  };

  return (
    <div style={{ marginTop: '-20px' }}>
      {headerNote && (
        <p style={{ marginTop: '0', fontSize: '12px', opacity: .6 }}>{headerNote}</p>
      )}
      {menus.map((restaurant, index) => (
        <div key={index}>
          <h5>{restaurant.name}</h5>
          <span style={{ fontSize: '13px', opacity: .4 }}>
            {restaurant.price} • {restaurant.time}{restaurant.pickedMenu?.isTomorrow ? ' • 내일' : ''}</span>
          <Spacer y={10} />

          {formatMenu(restaurant.pickedMenu.menu).map((item, idx, arr) => (
            <span style={{ opacity: .6 }}>{item}{idx < arr.length - 1 && ", "}</span>
          ))}

          <Spacer y={10} />
          {index < menus.length - 1 && <hr style={{ opacity: 0.3, margin: '10px 0 20px 0' }} />}
        </div >
      ))
      }

      <Spacer y={10} />
    </div >
  );
};

export default TodaysCafeteriaMenu;
