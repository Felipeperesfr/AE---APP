/* 
import ModernIcon from "../components/ModernIcon";
import React, { useState, useEffect, useMemo } from "react";
import { faSchool, faFilterCircleXmark, faClose, faPenToSquare, faTrash, faPlusCircle, faFilter, faReceipt, faDatabase, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useConfirm } from "../components/UseConfirm"
import { motion, AnimatePresence } from "framer-motion"
import Modal from '../components/Modal'
import ConfirmBox from "../components/ConfirmBox"





export default function GestãoFormandos() {

  // Types

  type escola = {
    nome: string,
    id: number
  }



  // Constantes



  const { open: openWarn, confirm: confirmWarn, handleResolve: handleResolveWarn } = useConfirm()
  const { open: openDelete, confirm: confirmDelete, handleResolve: handleResolveDelete } = useConfirm()



  // Funções Gerais


  // Funções Requests



  // Constantes useState
  const [subpage, setSubpage] = useState<string>("config-escolas")


  // Constantes useMemo




  // Funções useEffect




  return (
    <div className="configs-main-container">
      <ConfirmBox
        open={openDelete}
        title="Deletar Aluno?"
        message="Essa ação não pode ser desfeita."
        //onConfirm={async () => deleteProduct(selectedProduct!.id)}
        onResolve={handleResolveDelete}
      />

      <ConfirmBox
        open={openWarn}
        title="Aluno semelhante já existente"
        message="Há um aluno com o nome semelhante nessa escola, ano e turma! Prosseguir mesmo assim?"
        onResolve={handleResolveWarn}
      />



      <div className="content">
        <div className="bar-selection">
          <span className={`first bar ${subpage === "config-escolas" ? "active" : ""}`} onClick={() => { setSubpage("config-escolas") }}><ModernIcon direction="vertical-up" distance={50} icon={faReceipt} text="Gestão de Baixas"></ModernIcon></span>
        </div>
        <div className="subpage">

        </div>
      </div>

    </div>
  )
}
  */
