import './dashboard.css'
import Sidebar from '../layout/Sidebar/Sidebar';
import ContentTop from '../components/ContentTop/ContentTop';
import CurriculoDocente from '../components/Lattes/CurriculoDocente';

function CurriculosPage() {
  return (
    <>
      <div className='app'>
        <Sidebar />
        <div className='main-content'>
          <ContentTop showSearchButton={false} />
          <CurriculoDocente />
        </div>
      </div>
    </>
  )
}

export default CurriculosPage;
