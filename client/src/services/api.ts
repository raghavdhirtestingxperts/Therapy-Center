import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxied via Vite to http://localhost:5043
});

api.interceptors.request.use((config) => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const { token } = JSON.parse(savedUser);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
