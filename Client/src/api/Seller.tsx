import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000", // backend URL
  withCredentials: true,            // send cookies/session info
});

// Fetch all seller products
export async function getMyProducts() {
  try {
    const res = await API.get("/seller/products");
    return res.data;
  } catch (err: any) {
    console.error("Error fetching products:", err);
    throw err;
  }
}

// Create new product
export async function createProduct(product: any) {
  try {
    const res = await API.post("/seller/products", product);
    return res.data;
  } catch (err: any) {
    console.error("Error creating product:", err.response?.data || err);
    throw err;
  }
}

// Update product
export async function updateProduct(id: number, product: any) {
  try {
    const res = await API.put(`/seller/products/${id}`, product);
    return res.data;
  } catch (err: any) {
    console.error("Error updating product:", err.response?.data || err);
    throw err;
  }
}

// Delete product
export async function deleteProduct(id: number) {
  try {
    const res = await API.delete(`/seller/products/${id}`);
    return res.data;
  } catch (err: any) {
    console.error("Error deleting product:", err.response?.data || err);
    throw err;
  }
}
// Fetch public products (for buyers)
export async function getPublicProducts() {
  try {
    const res = await API.get("/products");
    return res.data;
  } catch (err: any) {
    console.error("Error fetching public products:", err);
    throw err;
  }
}