export type PeriodoStatus = 
  | 'pedidos_abertos'
  | 'retirada_liberada'
  | 'bloqueado'

function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

export function getPeriodoAtual(): PeriodoStatus {
  const agora = new Date()
  const minutos = agora.getHours() * 60 + agora.getMinutes()

  const iniciodia = horaParaMinutos('07:00')
  const fimDia = horaParaMinutos('13:00')
  const inicioRetirada1 = horaParaMinutos('09:40')
  const fimRetirada1 = horaParaMinutos('10:10')
  const inicioRetirada2 = horaParaMinutos('11:50')
  const fimRetirada2 = horaParaMinutos('13:15')

  // Após 13:15 tudo encerrado
  if (minutos >= fimRetirada2) {
    return 'bloqueado'
  }

  // Períodos de retirada
  if ((minutos >= inicioRetirada1 && minutos < fimRetirada1) ||
      (minutos >= inicioRetirada2 && minutos < fimRetirada2)) {
    return 'retirada_liberada'
  }

  // Horário de pedidos (07:00 às 13:00)
  if (minutos >= iniciodia && minutos < fimDia) {
    return 'pedidos_abertos'
  }

  // Antes das 7:00
  return 'bloqueado'
}

export function getMensagemPeriodo(): string {
  const periodo = getPeriodoAtual()
  const agora = new Date()
  const minutos = agora.getHours() * 60 + agora.getMinutes()

  switch (periodo) {
    case 'retirada_liberada':
      if (minutos < horaParaMinutos('10:10')) {
        return '🎉 Intervalo! Retire seu pedido até 10:10.'
      }
      return '🎉 Intervalo! Retire seu pedido até 13:15.'
    case 'bloqueado':
      return '⏰ Pedidos encerrados por hoje.'
    case 'pedidos_abertos':
      return 'Pedidos abertos até 13:00.'
  }
}