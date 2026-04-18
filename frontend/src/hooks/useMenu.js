
import { useState, useEffect } from "react";
import API from "../api/api";

const useMenu = (cafeId) => {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (!cafeId) return;

    fetchCategories();
    loadMenu();
  }, [cafeId]);

  // 🔥 Fetch categories by cafe
  const fetchCategories = async () => {
    try {
      const res = await API.get(`/menu/categories?cafeId=${cafeId}`);
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch categories");
    }
  };

  // 🔥 Load menu by cafe + category
  const loadMenu = async (category = "") => {
    try {
      let url = `/menu?cafeId=${cafeId}`;

      if (category) {
        url += `&category=${category}`;
      }

      const res = await API.get(url);

      setMenu(Array.isArray(res.data) ? res.data : []);
      setSelectedCategory(category);
    } catch (err) {
      console.error("Failed to load menu");
    }
  };

  return {
    menu,
    categories,
    selectedCategory,
    loadMenu,
  };
};

export default useMenu;