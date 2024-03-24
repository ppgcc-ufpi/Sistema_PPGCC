import './dashboard.css'
import Sidebar from '../layout/Sidebar/Sidebar';
import Content from '../layout/Content/Content';

function Dashboard() {
  return (
    <>
      <div className='app'>
        <Sidebar />
        <Content />
      </div>
    </>
  )
}

export default Dashboard;