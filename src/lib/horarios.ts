export type PeriodoStatus = 
  | 'pedidos_abertos'        // pode fazer pedidos
  | 'retirada_liberada'      // pode retirar, não pode fazer pedidos
  | 'bloqueado'              // não pode fazer pedidos nem retirar

interface Periodo {
  inicio: string  // HH:MM
  fim: string     // HH:MM
}

const PERIODOS_RETIRADA: Periodo[] = [
  { inicio: '09:40', fim: '10:10' }, // 1º intervalo
  { inicio: '11:50', fim: '13:15' }, // 2º intervalo
]

function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

export function getPeriodoAtual(): PeriodoStatus {
  const agora = new Date()
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes()

  for (const periodo of PERIODOS_RETIRADA) {
    const inicio = horaParaMinutos(periodo.inicio)
    const fim = horaParaMinutos(periodo.fim)

    if (minutosAgora >= inicio && minutosAgora < fim) {
      return 'retirada_liberada'
    }
  }

  // Após 13:15 bloqueia tudo
  if (minutosAgora >= horaParaMinutos('13:15')) {
    return 'bloqueado'
  }

  return 'pedidos_abertos'
}

export function getMensagemPeriodo(): string {
  const periodo = getPeriodoAtual()
  const agora = new Date()
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes()

  switch (periodo) {
    case 'retirada_liberada':
      if (minutosAgora < horaParaMinutos('10:10')) {
        return 'Intervalo! Retire seu pedido até 10:10.'
      }
      return 'Intervalo! Retire seu pedido até 13:15.'
    case 'bloqueado':
      return 'Pedidos encerrados por hoje.'
    case 'pedidos_abertos':
      if (minutosAgora < horaParaMinutos('09:40')) {
        return 'Pedidos abertos até 09:40.'
      }
      return 'Pedidos abertos até 11:50.'
  }
}