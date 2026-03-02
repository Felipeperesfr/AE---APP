
import ModernIcon from "../components/ModernIcon";
import React, { useState, useEffect, useMemo } from "react";
import { faSchool, faFilterCircleXmark, faClose, faPenToSquare, faTrash, faPlusCircle, faFilter, faReceipt, faDatabase, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useConfirm } from "../components/UseConfirm"
import { motion, AnimatePresence } from "framer-motion"
import Modal from '../components/Modal'
import ConfirmBox from "../components/ConfirmBox"
// SUBPAGES
import EscolasConfig from "./configSubPages/escolasConfig";




export default function ConfigsGerais() {

  // Types

  type escola = {
    nome: string,
    id: number
  }


  // Funções Gerais


  // Funções Requests



  // Constantes useState

  const [subpage, setSubpage] = useState<Subpage>("escolas-config")
  const [escolas, setEscolas] = useState<escola[]>([])

  // Constantes

  const { open: openWarn, confirm: confirmWarn, handleResolve: handleResolveWarn } = useConfirm()
  const { open: openDelete, confirm: confirmDelete, handleResolve: handleResolveDelete } = useConfirm()

  const subpages = {
    "escolas-config" : {
      "html" : <EscolasConfig></EscolasConfig>,
      "widht" : "fit-content"
    }
  };
  type Subpage = keyof typeof subpages;


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
          <span className={`first bar ${subpage === "escolas-config" ? "active" : ""}`} onClick={() => { setSubpage("escolas-config") }}><ModernIcon direction="vertical-up" distance={50} icon={faSchool} text="Escolas"></ModernIcon></span>
        </div>
        <div className="subpage" style={{width:subpages[subpage].widht}}>
          <>
            {subpages[subpage].html}
          </>
        </div>

      </div>

    </div>
  )
}
