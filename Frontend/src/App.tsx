import { Routes, Route } from "react-router-dom";
import {ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
// PAGES
import Home from "./pages/Home"
import Checklist from "./pages/Checklist"
import ListaCompras from "./pages/ListaCompras"
import ConfigGerais from "./pages/ConfigsGerais"
import GestãoFormandos from "./pages/GestãoFormandos"
// CSS PAGES
import "./cssPages/Home.css"
import "./cssPages/ListaCompras.css"
import "./cssPages/Checklist.css"
import "./cssPages/ConfigsGerais.css"
import "./cssPages/GestãoFormandos.css"
// COMPONENTS
import SideBar from './components/SideBar'
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


  // Variávies


  // Funções



  return (
    <div className="main-container">
      <ToastContainer autoClose={2500} />
      <Header />
      <SideBar />
      <main className="page">
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path="/gestão-formandos" element={<GestãoFormandos/>}></Route>
          <Route path='/lista-compras' element={<ListaCompras />}></Route>
          <Route path='/checklist' element={<Checklist />}></Route>
          <Route path='/configs' element={<ConfigGerais />}></Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
