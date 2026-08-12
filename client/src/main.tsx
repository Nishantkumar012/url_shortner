import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Login from "./pages/Login.tsx"
import Signup from './pages/Signup.tsx'
import Dashboard from './pages/Dashboard.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'


import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Analytics from './pages/Analytics.tsx'
import AdminLogin from './pages/AdminLogin.tsx'
import AdminDashboard from './pages/AdminDashboard.tsx'
import AdminRoute from './components/AdminRoute.tsx'

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
    element: (
      <ProtectedRoute>
        <Dashboard/>
      </ProtectedRoute>
    )
  },
  {
    path: "/analy",
    element: (
      <ProtectedRoute>
        <Analytics/>
      </ProtectedRoute>
    )

  },{
       path:"/admin",
       element:(
          <AdminLogin/>
       )
  },
  {
    path: "/admin/dashboard",
    element: (
      <AdminRoute>
        <AdminDashboard/>
      </AdminRoute>
    )
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
<RouterProvider router={router} />
    {/* <App /> */}
  </StrictMode>,
)

