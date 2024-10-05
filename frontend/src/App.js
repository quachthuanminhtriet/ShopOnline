import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
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

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cateId, setCateId] = useState('');
  const [cart, setCart] = useState([]);

  return (
    <BrowserRouter  >
      <Header setSearchQuery={setSearchQuery} setCateId={setCateId} />
      <Container>
        <Routes>
          <Route path='/' element={<Index searchQuery={searchQuery} cateId={cateId} />} />
          <Route path='/cart' element={<Cart cart={cart} setCart={setCart} />} />
          <Route path='/products/:id' element={<ProductDetail cart={cart} setCart={setCart} />} />
          <Route path='/login' element={<Login />} />
          <Route path='/status' element={<OrderTracking />} />
          <Route path='/profile' element={<Profile />} />
        </Routes>
      </Container>
    </BrowserRouter>

  );
}

export default App;
