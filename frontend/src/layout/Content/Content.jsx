import "./Content.css";
import ContentTop from '../../components/ContentTop/ContentTop';
import ContentMain from '../../components/ContentMain/ContentMain';

const Content = () => {
  return (
    <div className='main-content'>
      <ContentTop showSearchButton={true} />
      <ContentMain />
    </div>
  )
}

export default Content
