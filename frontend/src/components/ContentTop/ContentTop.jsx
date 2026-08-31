import { iconsImgs } from "../../utils/images";
import "./ContentTop.css";
import { useContext } from "react";
import { SidebarContext } from "../../context/sidebarContext";
import { useLocation } from "react-router-dom";

const ContentTop = ({ showSearchButton = true }) => {
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
            return 'Sistema PPGCC';
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
        <div className="content-top-btns">
          {showSearchButton && (
            <button type="button" className="search-btn content-top-btn">
              <img src={iconsImgs.search} alt="" />
            </button>
          )}
        </div>
      </div>
    );
  };

export default ContentTop
