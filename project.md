# Remedero

App pessoal de check-in de medicamentos com foto obrigatoria.

O conceito de plano representa um tratamento, por exemplo "Tratamento de ansiedade 1".
Dentro de cada plano, o usuario cadastra medicamentos e seus horarios:

- remedios X e Y as 08:00;
- remedio Z as 22:00.

Medicamentos do mesmo plano e do mesmo horario devem aparecer juntos em um unico check-in.
Cada plano tambem deve ter um campo de descricao longa para observacoes, contexto do tratamento e instrucoes pessoais.

Ao criar um plano, o app deve abrir a tela propria desse plano.
Nessa tela, o usuario pode adicionar remedios ao tratamento.
Adicionar remedio deve abrir uma tela propria de formulario.
Cada remedio dentro do plano deve ter:

- quantidade;
- agenda por dia da semana, selecionada por 7 bolinhas com multi-selecao;
- um ou mais horarios por dia selecionado.

Os horarios pertencem ao remedio dentro do plano, nao ao plano inteiro.
Para isso, o modelo deve separar a relacao `PlanoMedicamento` da relacao de horarios/dias desse remedio no plano.
Cada linha de agenda deve representar `planoMedicamentoId + diaSemana + horario`, permitindo casos como segunda a sexta em dois horarios e sabado em apenas um horario.

O plano deve poder ser editado e excluido.
Editar plano altera nome e descricao.
Excluir plano deve remover suas relacoes locais: remedios vinculados, agendas, notas e check-ins.

Na tela do plano, mostrar estatisticas derivadas dos dados locais, como total de check-ins, concluidos, perdidos, pendentes, taxa de conclusao, quantidade de remedios e quantidade de horarios.

O plano tambem deve permitir adicionar notas.
Cada nota pertence a um plano e deve guardar data/hora, texto livre e um sentimento selecionado.
Sentimentos iniciais: bem, mal, neutro, ansioso, cansado, calmo, triste e animado.

Historico:

- manter tiles com os medicamentos/check-ins planejados para hoje;
- abaixo dos tiles, mostrar um calendario do mes atual;
- dias sem bolinha nao tinham remedio planejado;
- bolinha verde indica que tomou todos os remedios do dia;
- bolinha vermelha indica que nao tomou nenhum remedio do dia;
- bolinha amarela indica que faltou algum remedio do dia.

Navegacao:

- no Android, o botao/gesto de voltar do sistema deve voltar pelas telas anteriores ate chegar na Home.

Stack inicial: Expo, SQLite local e exportacao de dados em JSON.
