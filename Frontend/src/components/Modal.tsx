import React, { useEffect } from "react";
import ReactDOM from "react-dom";

export interface ModalProps {
    open: boolean
    onClose: () => void
    children: React.ReactNode
    width?: string | number;
    height?: string | number;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children, width, height }) => {

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!open) return null

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="content"
                onClick={(e) => e.stopPropagation()} // recebe o evento do clique e não faz nada (impede que onclick do pai seja executado, ou seja, não fecha a modal)
                style={{
                    width,
                    height,
                }}
            >
                {children}
            </div>
        </div>,
        document.body
    )
}

export default Modal
