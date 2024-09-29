import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import './App.css';
import Header from './component/Layout/Header';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Index from './component/Index/Index';

function App() {
  return (
    <BrowserRouter  >
      <Header />
      <Container>
        <Routes>
          <Route path='/' element={<Index />}/>
        </Routes>
      </Container>
    </BrowserRouter>
    
  );
}

export default App;
