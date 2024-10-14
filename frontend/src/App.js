import 'bootstrap/dist/css/bootstrap.min.css';
import React, { createContext, useState } from 'react';
import './App.css';
import Header from './Layout/Header';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Index from './component/Index/Index';
import Cart from './component/Cart/Cart';
import ProductDetail from './component/Product/ProductDetail';
import Login from './component/User/Login';
import OrderTracking from './component/Order/OrderTracking';
import Profile from './component/User/Profile';
import Register from './component/User/Register';
import Footer from './Layout/Footer';

export const UserContext = createContext();

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cateId, setCateId] = useState('');
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Header setSearchQuery={setSearchQuery} setCateId={setCateId} />
        <Container>
          <Routes>
            <Route path='/' element={<Index searchQuery={searchQuery} cateId={cateId} />} />
            <Route path='/cart' element={<Cart cart={cart} setCart={setCart} />} />
            <Route path='/products/:id' element={<ProductDetail cart={cart} setCart={setCart} />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/status' element={<OrderTracking />} />
            <Route path='/profile' element={<Profile />} />
          </Routes>
        </Container>
        <Footer />
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;