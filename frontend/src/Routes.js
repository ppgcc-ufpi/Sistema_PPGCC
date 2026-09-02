import React from "react";
import { BrowserRouter as Router, Navigate, Routes, Route } from "react-router-dom";
import InitialPage from "./templates/InitialPage";
import Dashboard from "./templates/dashboard";
import CurriculosPage from "./templates/curriculosPage";
import RedeCoautoriaPage from "./templates/redeCoautoriaPage";
import ProducaoDocentePage from "./templates/producaoDocentePage";
import LoginPage from "./templates/loginPage";
import PrivateDashboardPage from "./templates/privateDashboardPage";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { useAuth } from "./context/authContext";

const PortalRedirect = () => {
    const { user } = useAuth();
    return <Navigate to={user?.perfil === 'COORDENACAO' ? '/coordination' : '/faculty'} replace />;
};

const AppRoutes = () => {
    return (
        <Router basename="/Sistema_PPGCC">
            <Routes>
                <Route path="/" element={<InitialPage />}></Route>
                <Route path="/dashboard" element={<Dashboard />}></Route>
                <Route path="/curriculos" element={<CurriculosPage />}></Route>
                <Route path="/producao-docente" element={<ProducaoDocentePage />}></Route>
                <Route path="/rede-coautoria" element={<RedeCoautoriaPage />}></Route>
                <Route path="/login" element={<LoginPage />}></Route>
                <Route path="/portal" element={
                    <ProtectedRoute><PortalRedirect /></ProtectedRoute>
                }></Route>
                <Route path="/coordination" element={
                    <ProtectedRoute roles={['COORDENACAO']}>
                        <PrivateDashboardPage role="COORDENACAO" />
                    </ProtectedRoute>
                }></Route>
                <Route path="/faculty" element={
                    <ProtectedRoute roles={['DOCENTE']}>
                        <PrivateDashboardPage role="DOCENTE" />
                    </ProtectedRoute>
                }></Route>
                <Route path="*" element={<Navigate to="/dashboard" replace />}></Route>
            </Routes>
        </Router>
    )
}

export default AppRoutes;
