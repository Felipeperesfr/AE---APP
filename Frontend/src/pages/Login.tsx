// src/pages/Login.tsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import ModernIcon from "../components/ModernIcon";
import { toast } from "react-toastify";



export default function Login() {
    // Constantes
    const { login } = useAuth();
    const navigate = useNavigate();

    // Constantes usestate
    const [userValue, setUserValue] = useState<string>("")
    const [pwValue, setPwValue] = useState<string>("")
    const [isVisible, setIsVisible] = useState<boolean>(false)

    // Funções Gerais
    const handleLogin = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify({ user: userValue, password: pwValue }),
        })
        if (response.ok)
            toast.success("Login efetuado com sucesso")
        else {
            const data = await response.json(); // 👈 parse body
            toast.error(`Erro: ${data.error}`)
        }

        login();
        navigate("/");
    };

    return (
        <div className="login-container">
            <div className="layout">
                <div className="content">
                    <h1>LOGIN</h1>
                    <div className="info">
                        <div className="user">
                            <p>Usuário:</p>
                            <input value={userValue} onChange={(e) => setUserValue(e.target.value)} type="text" />
                        </div>
                        <div className="password">
                            <p>Senha:</p>
                            <div className="inputlayout">
                                <input className="inputSenha" value={pwValue} onChange={(e) => setPwValue(e.target.value)} type={isVisible ? "text" : "password"} />
                                {isVisible ? <><span onClick={() => setIsVisible(!isVisible)}><ModernIcon text="Esconder" icon={faEyeSlash}></ModernIcon></span></> : <><span onClick={() => setIsVisible(!isVisible)}><ModernIcon text="Mostrar" icon={faEye}></ModernIcon></span></>}
                            </div>
                        </div>
                    </div>
                    <button onClick={handleLogin}>Entrar</button>
                </div>
            </div>
        </div>
    );
}