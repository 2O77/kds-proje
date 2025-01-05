import axios from "axios";

const API_URL = "http://localhost:3001/";

const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}login`, {
      username,
      password,
    });

    console.log("Login successful", response.data);
    localStorage.setItem("token", response.data.token);
    console.log(localStorage.getItem("token"));

    return response.data.token;
  } catch (error) {
    throw new Error("Login failed");
  }
};

const getToken = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await axios.get(`${API_URL}admin`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Token received:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Failed to get token",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to get token");
  }
};

const logout = () => {
  localStorage.removeItem("token");
  console.log("Logged out successfully");
};

export default {
  login,
  getToken,
  logout,
};
