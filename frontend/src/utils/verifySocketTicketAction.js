
const isNotViewAssignedTickets = () => {
  const configuracoes = JSON.parse(localStorage.getItem('configuracoes'))
  const conf = configuracoes?.find(c => c.key === 'NotViewAssignedTickets')
  return (conf?.value === 'enabled')
}

const verifySocketTicketAction = (ticket, action = null) => {
  const filtros = JSON.parse(localStorage.getItem('filtrosAtendimento'))
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const UserQueues = JSON.parse(localStorage.getItem('queues'))
  const profile = localStorage.getItem('profile')

  const isAdminShowAll = profile === 'admin' && filtros.showAll

  // Verificar si es admin y si está solicitando mostrar todos
  if (isAdminShowAll) {
    // console.log('isAdminShowAll', isAdminShowAll)
    return true
  }

  if (!ticket || ticket.status === 'closed') {
    // console.log('Sin ticket o estado cerrado', !ticket || ticket.status === 'closed')
    return true
  }

  // verificar se já é um ticket do usuário
  if (ticket.userId && ticket.userId === usuario.id) {
    // console.log('Ticket del usuario')
    return true
  }

  const whiteListAction = [
    'updateUnread',
    'delete'
  ]

  // verificar si la acción está en la lista blanca
  if (whiteListAction.includes(action)) {
    // console.log('Action WhiteLista', action)
    return true
  }

  // verificar si se está realizando búsqueda
  // if (filtros.searchParam) return false

  let isValid = false

  // Se o ticket não possuir fila definida, checar o filtro
  // permite visualizar tickets sin colas definidas es falso.
  if (!ticket.queueId && !filtros.includeNotQueueDefined) {
    // console.log('filtros.includeNotQueueDefined', !filtros.includeNotQueueDefined)
    return false
  }

  // verificar se o usuário possui fila liberada
  if (UserQueues.length) {
    const isQueueUser = UserQueues.findIndex(q => ticket.queueId === q.id)
    if (isQueueUser !== -1) {
      isValid = true
    } else if (!filtros.includeNotQueueDefined) {
      // console.log('Usuario no tiene acceso a la cola y !filtros.includeNotQueueDefined')
      return false
    }
  }

  // verificar se a fila do ticket está filtrada
  if (filtros.queuesIds.length) {
    const isQueue = filtros.queuesIds.findIndex(q => ticket.queueId === q)
    if (isQueue !== -1) {
      isValid = true
    } else {
      // console.log('colas filtradas y diferentes a la del ticket')
      return false
    }
  }

  // verificar se filtro incluir tickets sem filas definida ativo - includeNotQueueDefined
  if (filtros.includeNotQueueDefined) {
    const isIncludeNotQueueDefined = filtros.includeNotQueueDefined && !ticket.queueId
    if (isIncludeNotQueueDefined) {
      isValid = true
    } else {
      // console.log('ticket sin cola y filtros.includeNotQueueDefined inactivo')
      return false
    }
  }

  // verificar se status do ticker está filtrado
  if (filtros.status.length) {
    const isStatus = filtros.status.findIndex(s => ticket.status === s)
    if (isStatus !== -1) {
      isValid = true
    } else {
      // console.log('Estado del ticket no está filtrado')
      return false
    }
  }

  // verificar se o parametro para não permitir visualizar
  // tickets asignados a otros usuarios está activo
  if (isNotViewAssignedTickets()) {
    if (ticket.userId && ticket.userId !== usuario.id) {
      // console.log('isNotViewAssignedTickets y ticket no es del usuario')
    } return false
  }

  // verificar se filtro somente tickets não assinados (isNotAssingned) ativo
  if (filtros.isNotAssignedUser) {
    const isNotAssignedUser = filtros.isNotAssignedUser && !ticket.userId
    if (isNotAssignedUser) {
      isValid = true
    } else {
      // console.log('isNotAssignedUser activo para mostrar solo tickets no asignados'}
      return false
    }
  }

  if (!isValid) {
    throw new Error('VerifySocketTicketAction: false')
  }
}

export default verifySocketTicketAction
