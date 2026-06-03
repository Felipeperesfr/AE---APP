import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
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

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/getcsv`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();



            if (!response.ok) {
                toast.error(data.error ?? "Erro ao importar CSV");
                return;
            }

            if (data.ignorados > 0) {
                toast.warning(
                    `Importação concluída. ${data.adicionados} registro(s) processados e ${data.ignorados} linha(s) foram ignoradas por possuírem dados inválidos.`
                );

                console.group("Linhas inválidas do CSV");
                console.table(data.linhasInvalidas);
                console.groupEnd();
            } else {
                toast.success(
                    `${data.adicionados} registro(s) importados com sucesso!`
                )
                setTimeout(() => {
                    window.location.reload();
                }, 2000)
            }

            return data;

        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar arquivo.");
        }
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

                    <label className="menu-entry" htmlFor="csvInput">
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