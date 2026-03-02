import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
// PAGES
import Home from "./pages/Home"
import Checklist from "./pages/Checklist"
import ListaCompras from "./pages/ListaCompras"
//import ConfigGerais from "./pages/ConfigsGerais"
import GestãoFormandos from "./pages/GestãoFormandos"
import LoginPage from "./pages/Login"
// CSS PAGES
import "./cssPages/Home.css"
import "./cssPages/ListaCompras.css"
import "./cssPages/Checklist.css"
import "./cssPages/ConfigsGerais.css"
import "./cssPages/GestãoFormandos.css"
import "./cssPages/Login.css"
// COMPONENTS
import SideBar from './components/SideBar'
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header"
// CSS COMPONENTS
import "./cssComponents/modal.css"
import "./cssComponents/confirmbox.css"
import "./cssComponents/sideMenu.css"
import "./cssComponents/modernIcon.css"
import "./cssComponents/header.css"





function App() {

  // Types


  // Variaveis useState



  // Funções useEffect


  // Constantes

  const isLoginPage = window.location.pathname === "/login";

  // Variávies


  // Funções



  return (
    <div className="main-container">
      <ToastContainer autoClose={2500} />
      {!isLoginPage && <Header />}
      {!isLoginPage && <SideBar />}
      <main className="page">
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute><Home /></ProtectedRoute>} path="/" />

          <Route element={<ProtectedRoute><GestãoFormandos /></ProtectedRoute>} path="/gestão-formandos" />

          <Route element={<ProtectedRoute><ListaCompras /></ProtectedRoute>} path="/lista-compras" />

          <Route element={<ProtectedRoute><Checklist /></ProtectedRoute>} path="/checklist" />

        </Routes>
      </main>
    </div>
  );
}

export default App;
