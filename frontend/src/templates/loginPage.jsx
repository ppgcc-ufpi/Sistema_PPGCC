import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
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
  const [showPassword, setShowPassword] = useState(false);
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
          <h1 id="login-title">Acesso ao Observatório PPG</h1>
          <p>Entre com a conta fornecida pela coordenação do programa.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" autoComplete="username" required value={email}
            onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="password">Senha</label>
          <div className="password-field">
            <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password}
              onChange={(event) => setPassword(event.target.value)} />
            {password.length > 0 && (
              <button
                type="button"
                className="password-toggle"
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
              </button>
            )}
          </div>
          {error && <p className="restricted-error" role="alert">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <Link className="restricted-back" to="/dashboard">Voltar</Link>
      </section>
    </main>
  );
};

export default LoginPage;
