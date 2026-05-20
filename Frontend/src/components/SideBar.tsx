import { NavLink } from "react-router-dom";
import ModernIcon from "./ModernIcon";
import React, { useState } from 'react';
import { faUpload, faClipboardList, faGear, faCheck, faArrowCircleLeft, faList, faGraduationCap } from "@fortawesome/free-solid-svg-icons";

export default function SideBar() {

    //USE STATE
    const [showMenu, setShowMenu] = useState<boolean>(true)

    // Funções Gerais    
    async function uploadCSV(input: HTMLInputElement) {

        if (!input.files?.length) {
            return;
        }

        const file = input.files[0];

        const formData = new FormData();

        formData.append("file", file);

        const response = await fetch(
            `${process.env.REACT_APP_API_URL}/getcsv`,
            {
                method: "POST",
                body: formData
            }
        );

        return await response.json();
    }

    return (
        <>
            {showMenu ? (
                <nav className="side-menu">
                    <NavLink className="menu-entry" to="/gestão-formandos">
                        <ModernIcon icon={faGraduationCap} text="Gestão Formandos" distance={60} />
                    </NavLink>

                    <NavLink className="menu-entry" to="/lista-compras">
                        <ModernIcon icon={faClipboardList} text="Lista de Compras" distance={60} />
                    </NavLink>

                    <NavLink className="menu-entry" to="/checklist">
                        <ModernIcon icon={faCheck} text="Checklists" distance={60} />
                    </NavLink>

                    <NavLink className="menu-entry" to="/configs">
                        <ModernIcon icon={faGear} text="Configs Gerais" distance={60} />
                    </NavLink>

                    <input
                        type="file"
                        id="csvInput"
                        hidden
                        accept=".csv"
                        onChange={(event) => { uploadCSV(event.target) }}
                    />

                    <label  className="menu-entry" htmlFor="csvInput">
                        <ModernIcon icon={faUpload} text="Upload CSV" distance={60} />
                    </label>

                    <span
                        className="hide-menu"
                        onClick={() => setShowMenu(false)}
                    >
                        <ModernIcon icon={faArrowCircleLeft} text="Fechar menu" />
                    </span>
                </nav>
            ) : (
                <span
                    className="open-menu"
                    onClick={() => setShowMenu(true)}
                >
                    <ModernIcon icon={faList} text="Abrir menu" />
                </span>
            )}

        </>
    )
}