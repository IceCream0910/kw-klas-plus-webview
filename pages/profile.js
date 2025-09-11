"use client";
import { useState, useEffect } from "react";
import Header from "../components/common/header";
import ProfileCard from "../components/profile/ProfileCard";
import SearchBar from "../components/profile/SearchBar";
import FavoriteSection from "../components/profile/FavoriteSection";
import MenuSection from "../components/profile/MenuSection";
import StudentIDModal from "../components/profile/StudentIDModal";
import MenuSettingsModal from "../components/profile/MenuSettingsModal";
import { menuItems } from "../lib/profile/menuItems";
import {
  useProfileData,
  useMenuSettings,
  useGradeSettings,
  useModalSettings
} from "../lib/profile/useProfileData";
import 'react-spring-bottom-sheet/dist/style.css'; export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, totGrade, stdInfo } = useProfileData();
  const { hideGrades, showGrades, handleGradeClick } = useGradeSettings();
  const {
    isOpenSettingsModal,
    isCardOpen,
    setIsOpenSettingsModal,
    setIsCardOpen,
    handleCardClick
  } = useModalSettings();
  const {
    menuOrder,
    favorites,
    handleMenuReorder,
    handleResetMenuOrder,
    handleToggleFavorite
  } = useMenuSettings(menuItems);

  const sortedMenuItems = menuOrder.map(title =>
    menuItems.find(item => item.title === title)
  ).filter(Boolean);

  const filteredMenuItems = sortedMenuItems
    .map(category => ({
      ...category,
      items: category.items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(category => category.items.length > 0);

  const handleMenuClick = (url) => {
    Android.openPage(url);
  };

  return (
    <main>
      <Header title={<h2>전체</h2>} />

      <ProfileCard
        data={data}
        stdInfo={stdInfo}
        totGrade={totGrade}
        hideGrades={hideGrades}
        showGrades={showGrades}
        onCardClick={handleCardClick}
        onGradeClick={handleGradeClick}
      />

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSettingsClick={() => setIsOpenSettingsModal(!isOpenSettingsModal)}
      />

      <FavoriteSection
        menuItems={menuItems}
        favorites={favorites}
        onMenuClick={handleMenuClick}
        onFavoriteToggle={handleToggleFavorite}
      />

      {filteredMenuItems.map((category, index) => (
        <MenuSection
          key={`category-${index}`}
          category={category}
          favorites={favorites}
          onMenuClick={handleMenuClick}
          onFavoriteToggle={handleToggleFavorite}
        />
      ))}

      <StudentIDModal
        isOpen={isCardOpen}
        onClose={() => setIsCardOpen(false)}
        data={data}
        stdInfo={stdInfo}
      />

      <MenuSettingsModal
        isOpen={isOpenSettingsModal}
        onClose={() => setIsOpenSettingsModal(false)}
        menuOrder={menuOrder}
        onMenuReorder={handleMenuReorder}
        onResetMenuOrder={handleResetMenuOrder}
      />
    </main>
  );
}