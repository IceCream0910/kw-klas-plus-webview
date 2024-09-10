import React from 'react';

const TodaysCafeteriaMenu = ({ weeklyMenu }) => {
  if (!weeklyMenu) return null;

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayMenu = weeklyMenu.find(item => item.date === today);

  if (!todayMenu) {
    return <div>
      <p style={{ marginBottom: '20px', marginTop: '-5px', fontSize: '15px', opacity: .5 }}>오늘의 학식 정보가 없습니다.</p>
    </div>;
  }

  const parseMenu = (menuString) => {
    const sections = menuString.split('<').slice(1);
    return sections.reduce((acc, section) => {
      const [title, ...items] = section.split('\r\n');
      acc[title.replace(/[<>]/g, '')] = items.filter(item => item.trim() !== '');
      return acc;
    }, {});
  };

  const menu = parseMenu(todayMenu.menu);

  return (
    <div>
      {Object.entries(menu).map(([section, items]) => (
        <div style={{ marginBottom: '30px', lineHeight: '0.2' }}>
          <h5 style={{ marginBottom: '20px' }}>{section}</h5>
          {items.map((item, index) => (
            <p style={{ fontSize: '15px', opacity: .8 }} key={index}>{item}</p>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TodaysCafeteriaMenu;