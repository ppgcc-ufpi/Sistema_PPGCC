import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import Logo from '../img/brasao_ufpi.png';
import './restrictedArea.css';

const destinationFor = (user) => user.perfil === 'COORDENACAO' ? '/coordination' : '/faculty';

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to={destinationFor(user)} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const authenticatedUser = await login(email, password);
      const requestedPath = location.state?.from?.pathname;
      navigate(requestedPath || destinationFor(authenticatedUser), { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível entrar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="restricted-page login-page">
      <section className="login-card" aria-labelledby="login-title">
        <img src={Logo} alt="Brasão da UFPI" />
        <div>
          <p className="restricted-eyebrow">Área restrita</p>
          <h1 id="login-title">Acesso ao Sistema PPGCC</h1>
          <p>Entre com a conta fornecida pela coordenação do programa.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" autoComplete="username" required value={email}
            onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="password">Senha</label>
          <input id="password" type="password" autoComplete="current-password" required value={password}
            onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="restricted-error" role="alert">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <Link className="restricted-back" to="/dashboard">Voltar aos dashboards públicos</Link>
      </section>
    </main>
  );
};

export default LoginPage;
