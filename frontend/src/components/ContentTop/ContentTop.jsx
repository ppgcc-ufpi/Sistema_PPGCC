import { iconsImgs } from "../../utils/images";
import "./ContentTop.css";
import { useContext } from "react";
import { SidebarContext } from "../../context/sidebarContext";
import { useLocation } from "react-router-dom";

const ContentTop = () => {
    const { toggleSidebar } = useContext(SidebarContext);
    const location = useLocation()

    const getTitle = () => {
        switch (location.pathname) {
          case '/dashboard':
            return 'Home';
          case '/rede-coautoria':
            return 'Rede de Coautoria';
          case '/curriculos':
            return 'Currículos';
          case '/producao-docente':
            return 'Produção Docente';
          case '/login':
            return 'Área restrita';
          default:
            return 'Observatório PPG - PPGCC';
        }
      };

    return (
      <div className="main-content-top">
        <div className="content-top-left">
          <button type="button" className="sidebar-toggler" onClick={() => toggleSidebar()}>
            <img src={iconsImgs.menu} alt="" />
          </button>
          <h3 className="content-top-title">{getTitle()}</h3>
        </div>
      </div>
    );
  };

export default ContentTop
