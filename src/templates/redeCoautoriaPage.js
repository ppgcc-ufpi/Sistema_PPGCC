import './dashboard.css';
import Sidebar from '../layout/Sidebar/Sidebar';
import ContentTop from '../components/ContentTop/ContentTop';
import RedeCoautoria from '../components/Coautoria/RedeCoautoria';

const RedeCoautoriaPage = () => (
  <div className="app">
    <Sidebar />
    <div className="main-content">
      <ContentTop showSearchButton={false} />
      <RedeCoautoria />
    </div>
  </div>
);

export default RedeCoautoriaPage;

