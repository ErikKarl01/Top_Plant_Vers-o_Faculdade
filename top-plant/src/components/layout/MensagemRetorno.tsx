type MensagemRetornoProps = {
  response: {
    sucess?: boolean;
    mensage?: string | string[] | Record<string, string>;
  } | null;
};

export function MensagemRetorno({ response }: MensagemRetornoProps) {
  // Se não tem resposta da API ainda, não renderiza nada
  if (!response) return null;

  const isSuccess = response.sucess;

  // O backend pode mandar a mensagem como texto (string) ou como objeto de erros (ex: { mens_doc: "CPF inválido" })
  let mensagens: string[] = [];
  
  if (typeof response.mensage === 'string') {
    mensagens = [response.mensage];
  } else if (Array.isArray(response.mensage)) {
    mensagens = response.mensage;
  } else if (typeof response.mensage === 'object' && response.mensage !== null) {
    mensagens = Object.values(response.mensage).map(String);
  }

  return (
    <div className={`mb-6 p-4 border rounded-xl text-sm animate-fade-in ${
      isSuccess 
        ? 'bg-green-50 border-green-200 text-green-700' 
        : 'bg-red-50 border-red-200 text-red-600'
    }`}>
      <p className="font-semibold mb-1">
        {isSuccess ? 'Sucesso!' : 'Atenção, verifique os seguintes itens:'}
      </p>
      <ul className={mensagens.length > 1 ? "list-disc pl-5 mt-2" : "mt-1"}>
        {mensagens.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
