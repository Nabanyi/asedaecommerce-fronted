import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { UserContextProvider } from './UserContext';
import { OpenRoute } from './OpenRoute';
import { PrivateRoute } from './PrivateRoute';
import { NoPage } from './pages/NoPage';
import {Account} from './pages/Profile';
import Layout from './components/Layout';
import { Product } from './pages/Product';
import { Ads } from './pages/Ads';
import {Brands} from './pages/Brands';
import {Categories} from './pages/Categories';
import Orders from './pages/Orders';


function App() {
  return (
    <Router>

      <UserContextProvider>
        <Routes>
          <Route path="/login" element={
            <OpenRoute>
              <Login />
            </OpenRoute>
            } 
          />

          <Route path="/" element={
            <PrivateRoute>
              <Layout currentPage='home'>
                <Home />
              </Layout>
            </PrivateRoute>
            } 
          />

          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Layout currentPage='home'>
                  <Home />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/ads"
            element={
              <PrivateRoute>
                <Layout currentPage='ads'>
                  <Ads />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/product/:productId"
            element={
              <PrivateRoute>
                <Layout currentPage="home">
                  <Product />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/account"
            element={
              <PrivateRoute>
                <Layout currentPage="account">
                  <Account />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <Layout currentPage="orders">
                  <Orders />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/categories"
            element={
              <PrivateRoute>
                <Layout currentPage="categories">
                  <Categories />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/brands"
            element={
              <PrivateRoute>
                <Layout currentPage="brands">
                  <Brands />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="*"
            element={
              <NoPage />
            }
          />
        </Routes>
      </UserContextProvider>
    </Router>
  )
}

export default App
