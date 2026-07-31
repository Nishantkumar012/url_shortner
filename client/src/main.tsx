import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Login from "./pages/Login.tsx"
import Signup from './pages/Signup.tsx'
import Dashboard from './pages/Dashboard.tsx'


import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
  },
  {
    path: "/login",
    element: <Login/>
  },
  {
    path: "/signup",
    element: <Signup/>
  },
  {
    path: "/dash",
    element: <Dashboard/>
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
<RouterProvider router={router} />
    {/* <App /> */}
  </StrictMode>,
)

