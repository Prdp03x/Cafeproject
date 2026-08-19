import { useState, useEffect } from "react";
import API from "../api/api";

const useCafe = (cafeId) => {
  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cafeId) return;

    const fetchCafe = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await API.get(`/cafes/${cafeId}`);
        setCafe(res.data);
      } catch (err) {
        console.error("Cafe not found");
        setError(err);
        setCafe({ name: "Cafe" }); // fallback
      } finally {
        setLoading(false);
      }
    };

    fetchCafe();
  }, [cafeId]);

  return { cafe, loading, error };
};

export default useCafe;