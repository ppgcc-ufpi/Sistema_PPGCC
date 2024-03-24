import "./ContentMain.css";
import Discentes_Mestrado from "../Discentes_Mestrado/Discentes_Mestrado";
import Tempo_Medio_Titulacao from "../Tempo_Medio_Titulacao/Tempo_Medio_Titulacao";
import Turmas_Ofertadas from "../Turmas_Ofertadas/Turmas_Ofertadas";
import Docentes from "../Docentes/Docentes";
import Projetos_Pesquisa from "../Projetos_Pesquisa/Projetos_Pesquisa";
import Savings from "../Savings/Savings";
import Producao_Tecnica from "../Producao_Tecnica/Producao_Tecnica";
import Financial from "../Financial/Financial";

const ContentMain = () => {
  return (
    <div className="main-content-holder">
        <div className="content-grid-one">
            <Discentes_Mestrado />
            <Tempo_Medio_Titulacao />
            <Turmas_Ofertadas />
        </div>
        <div className="content-grid-two">
            <Docentes />
            <div className="grid-two-item">
              <div className="subgrid-two">
                <Projetos_Pesquisa />
                {/* <Savings /> */}
              </div>
            </div>

            <div className="grid-two-item">
              <div className="subgrid-two">
                <Producao_Tecnica />
                {/* <Financial /> */}
              </div>
            </div>
        </div>
    </div>
  )
}

export default ContentMain
