// import { useState, useEffect } from "react";
// import API from "../api/api";

// const useMenu = () => {
//   const [menu, setMenu] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState("");

//   useEffect(() => {
//     fetchCategories();
//     loadMenu();
//   }, []);

//   const fetchCategories = async () => {
//     const res = await API.get("/menu/categories");
//     setCategories(res.data);
//   };

//   const loadMenu = async (category = "") => {
//     const url = category ? `/menu?category=${category}` : "/menu";
//     const res = await API.get(url);
//     setMenu(res.data);
//     setSelectedCategory(category);
//   };

//   return {
//     menu,
//     categories,
//     selectedCategory,
//     loadMenu,
//   };
// };

// export default useMenu;

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
      setCategories(res.data);
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

      setMenu(res.data);
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