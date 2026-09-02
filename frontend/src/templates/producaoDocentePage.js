import './dashboard.css';
import Sidebar from '../layout/Sidebar/Sidebar';
import ContentTop from '../components/ContentTop/ContentTop';
import VisaoGeralLattes from '../components/Lattes/VisaoGeralLattes';

function ProducaoDocentePage() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <ContentTop />
        <VisaoGeralLattes />
      </main>
    </div>
  );
}

export default ProducaoDocentePage;
