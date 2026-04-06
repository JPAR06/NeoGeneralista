import { useRouter } from "next/router";
import Link from "next/link";
import ConstellationCanvasAH from "../../components/ConstellationCanvasAH";

const ERROR_MESSAGES = {
  Configuration: "Erro de configuração do servidor.",
  AccessDenied: "Acesso negado.",
  Verification: "O link de verificação expirou.",
  OAuthSignin: "Erro ao iniciar sessão com Google.",
  OAuthCallback: "Erro ao concluir sessão com Google.",
  OAuthCreateAccount: "Não foi possível criar conta com Google.",
  EmailCreateAccount: "Não foi possível criar conta com este e-mail.",
  Callback: "Erro no callback de autenticação.",
  OAuthAccountNotLinked: "Este e-mail já está associado a outra forma de login.",
  CredentialsSignin: "E-mail ou palavra-passe incorretos.",
  Default: "Ocorreu um erro na autenticação.",
};

export default function ErroAuth() {
  const router = useRouter();
  const { error } = router.query;
  const message = ERROR_MESSAGES[error] || ERROR_MESSAGES.Default;

  return (
    <div className="ahv4-auth-page">
      <ConstellationCanvasAH />
      <div className="ahv4-auth-card ahv4-auth-card--error">
        <img src="/algoritmo-humano-logo-cor.png" alt="AlgoritmoHumano" className="ahv4-auth-logo" />
        <div className="ahv4-auth-error-icon">✕</div>
        <h1 className="ahv4-auth-title">Erro na autenticação</h1>
        <p className="ahv4-auth-error-msg">{message}</p>
        <Link href="/auth/entrar" className="ahv4-auth-submit ahv4-auth-submit--link">
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
