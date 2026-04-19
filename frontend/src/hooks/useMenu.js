
import { useState, useEffect, useCallback } from "react";
import API from "../api/api";

const useMenu = (cafeId) => {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

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
  const loadMenu = useCallback (async (category = "") => {
    try {
      setLoading(true);

      let url = `/menu?cafeId=${cafeId}`;
      if (category) {
        url += `&category=${category}`;
      }

      const res = await API.get(url);

      setMenu(Array.isArray(res.data) ? res.data : []);
      setSelectedCategory(category);
    } catch (err) {
      console.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  },[cafeId]);

  return {
    menu,
    categories,
    selectedCategory,
    loadMenu,
    loading
  };
};

export default useMenu;