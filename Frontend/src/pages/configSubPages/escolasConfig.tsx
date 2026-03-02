
import ModernIcon from "../../components/ModernIcon";
import React, { useState, useEffect, useMemo } from "react";
import { faSchool, faFilterCircleXmark, faClose, faPenToSquare, faTrash, faPlusCircle, faFilter, faReceipt, faDatabase, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useConfirm } from "../../components/UseConfirm"
import { motion, AnimatePresence } from "framer-motion"
import Modal from '../../components/Modal'
import ConfirmBox from "../../components/ConfirmBox"






export default function EscolasConfig() {

    // Types

    type escola = {
        nome: string,
        id?: number
    }

    // Constante

    const EMPTY_ESCOLA = {
        nome: "",
        id: 0
    }

    // Funções Gerais


    // Funções Requests



    // Constantes useState
    const [openModalNew, setOpenModalNew] = useState<boolean>(false)
    const [newEscola, setNewEscola] = useState<string>("")
    const [escolas, setEscolas] = useState<escola[]>()
    const [modalMode, setModalMode] = useState<"New" | "Edit">("New")


    // Constantes useMemo




    // Funções useEffect

    useEffect(() => {
        const loadData = async () => {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/getescolas`);
            const data = await response.json();
            //console.log(data)
            setEscolas(data);
        };

        loadData();
    }, [])


    return (

        <div className="escolas-config">

            <Modal open={openModalNew} onClose={() => setOpenModalNew(false)} height={150}>
                <header>
                    <div />
                    <h1>Adicionar Escola</h1>
                    <span className="close-modal-icon" onClick={() => setOpenModalNew(false)}><ModernIcon icon={faClose} direction="horizontal-right" text="Fechar"></ModernIcon></span>
                </header>
                <div className="body">
                    <div className="input">
                        <p>Nome:</p>
                        <input type="text" onChange={(e) => {
                            setNewEscola(e.target.value)
                        }} />
                    </div>
                    <button onClick={async () => {
                        const nomeEscola = newEscola

                        const response = await fetch(`${process.env.REACT_APP_API_URL}/newescola`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", },
                            body: JSON.stringify({ nome: nomeEscola }),
                        })

                        if (!response.ok) {
                            const errorData = await response.json();
                            toast.error(errorData.error ?? "Erro inesperado.");
                            return;
                        }

                        const data = await response.json();
                        setEscolas(data)
                        setNewEscola(EMPTY_ESCOLA.nome)
                        toast.success("Aluno adicionado!");

                    }}>Adicionar</button>
                </div>

            </Modal>




            <div className="header">
                <h2>Escolas</h2>
                <span onClick={() => setOpenModalNew(true)} className="add-school-icon"><ModernIcon text="Adicionar Escola" icon={faPlusCircle}></ModernIcon></span>
            </div>
            <ul className="lista-escolas">
                <>
                    {!escolas || escolas.length === 0 ? <h1>Nenhuma escola cadastrada</h1> :
                        (
                            escolas.map((es: escola) => (
                                <li key={es.id}><span className="nome">{es.nome}</span><span className="icon"><ModernIcon direction="horizontal-left" icon={faPenToSquare} text="Editar"></ModernIcon></span><span className="icon"><ModernIcon icon={faTrash} text="Deletar"></ModernIcon></span></li>
                            ))
                        )

                    }
                </>
            </ul>
        </div>
    )
}
