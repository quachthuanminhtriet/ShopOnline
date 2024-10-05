import axios from "axios";

const HOST = 'http://127.0.0.1:8000';

export const endpoints = {
    'login': '/o/token/',
    'register': '/register/',
    'current-user': '/users/current-user/',
    'banners': 'banners',
    'categories': '/categories/',
    'products': '/products/',
    'brands': '/brands/',
    'colors_product': '/colors_product/',
    'images_product': '/images_product/',
    'orders': '/orders/',
    'order-items': '/order_items/',  
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