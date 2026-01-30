"use client";
import { useState, useEffect } from "react";
import Header from "../components/common/header";
import ProfileCard from "../components/profile/ProfileCard";
import SearchBar from "../components/profile/SearchBar";
import FavoriteSection from "../components/profile/FavoriteSection";
import MenuSection from "../components/profile/MenuSection";
import StudentIDModal from "../components/profile/StudentIDModal";
import { menuItems } from "../lib/profile/menuItems";
import {
  useProfileData,
  useMenuSettings,
  useModalSettings
} from "../lib/profile/useProfileData";
import 'react-spring-bottom-sheet/dist/style.css';
import BottomNav from "../components/common/bottomNav";
import Spacer from "../components/common/spacer";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, totGrade, stdInfo } = useProfileData();
  const {
    isCardOpen,
    setIsCardOpen,
    handleCardClick
  } = useModalSettings();
  const {
    favorites,
    handleToggleFavorite
  } = useMenuSettings();

  const filteredMenuItems = menuItems
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
      <BottomNav currentTab="menu" />

      <ProfileCard
        data={data}
        stdInfo={stdInfo}
        totGrade={totGrade}
        onCardClick={handleCardClick}
      />

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {!searchTerm && <FavoriteSection
        menuItems={menuItems}
        favorites={favorites}
        onMenuClick={handleMenuClick}
        onFavoriteToggle={handleToggleFavorite}
      />}

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

      <Spacer y={80} />

    </main>
  );
}