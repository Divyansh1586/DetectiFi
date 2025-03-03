import { jwtDecode } from "jwt-decode";

export const getToken = () => localStorage.getItem('token');
export const getUser = () => JSON.parse(localStorage.getItem('user'));

export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
};

export const checkAuthStatus = () => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
        clearAuth();
        return false;
    }
    return true;
};

export const setAuth = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};