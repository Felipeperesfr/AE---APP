import { NavLink } from "react-router-dom";
import ModernIcon from "./ModernIcon";
import React, { useState } from 'react';
import { faClipboardList, faGear, faCheck, faArrowCircleLeft, faList, faGraduationCap} from "@fortawesome/free-solid-svg-icons";

export default function SideBar() {

    //USE STATE
    const [showMenu, setShowMenu] = useState<boolean>(true)

    return (
        <>
            {showMenu ? (
                <nav className="side-menu">
                    <NavLink className="menu-entry" to="/gestão-formandos">
                        <ModernIcon icon={faGraduationCap} text="Gestão Formandos" distance={60}/>
                    </NavLink>

                    <NavLink className="menu-entry" to="/lista-compras">
                        <ModernIcon icon={faClipboardList} text="Lista de Compras" distance={60}/>
                    </NavLink>

                    <NavLink className="menu-entry" to="/checklist">
                        <ModernIcon icon={faCheck} text="Checklists" distance={60}/>
                    </NavLink>

                    <NavLink className="menu-entry" to="/configs">
                        <ModernIcon icon={faGear} text="Configs Gerais" distance={60} />
                    </NavLink>

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