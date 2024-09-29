import axios from "axios";

const HOST = 'http://127.0.0.1:8000';

export const endpoints = {
    'categories': '/categories/',
}

export const authAPI = (accessToken) => axios.create({
    baseURL: HOST,
    headers: {
        "Authorization": `Bearer ${accessToken}`
    },
});

export default axios.create({
    baseURL: HOST,
})