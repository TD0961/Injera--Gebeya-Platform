import axios from "axios";

const API_URL = "http://localhost:4000"; // your Go backend URL

export async function getMyProducts(token: string) {
  const res = await axios.get(`${API_URL}/seller/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function addProduct(product: any, token: string) {
  const res = await axios.post(`${API_URL}/seller/products`, product, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
