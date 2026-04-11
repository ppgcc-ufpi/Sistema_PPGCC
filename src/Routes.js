import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InitialPage from "./templates/InitialPage";
import XLSXReader from "./XLSXTest";
import Dashboard from "./templates/dashboard";
import CurriculosPage from "./templates/curriculosPage";



const AppRoutes = () => {
    return (
        <Router basename="/Sistema_PPGCC">
            <Routes>
                <Route path="/" element={<InitialPage />}></Route>
                <Route path="/graficos" element={<XLSXReader />}></Route>
                <Route path="/dashboard" element={<Dashboard />}></Route>
                <Route path="/curriculos" element={<CurriculosPage />}></Route>
            </Routes>
        </Router>
    )
}

export default AppRoutes;