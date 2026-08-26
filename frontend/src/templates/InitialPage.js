import React from "react";
import '../styles/InitialPage.css'
import Logo from '../img/brasao_ufpi.png'
import { Link } from "react-router-dom";

const InitialPage = () => {
    return (
        <>
            <div className="w-screen h-screen bg-bgcolor flex justify-center items-center flex-col gap-6">
                <div className="w-56 mb-8">
                    <img src={Logo} alt="brasao"/>
                </div>
                <div>
                    <h1 className="text-5xl">Sistema PPGCC</h1>
                </div>
                <div className="w-screen h-7 flex justify-center">
                    <button className="bg-secondbgcolor hover:bg-hovercolor w-20 rounded-lg font-bold"><Link className="text-black" to="/dashboard">Entrar</Link></button>
                </div>
            </div>
        </>
    );
};

export default InitialPage;