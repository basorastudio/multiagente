const errors = [
  {
    error: 'ERR_SESSION_EXPIRED',
    description: 'Tu sesión ha expirado.',
    detail: 'La validez de tu sesión ha expirado. Es necesario iniciar sesión nuevamente.'
  },
  {
    error: 'ERR_API_CONFIG_NOT_FOUND',
    description: 'Configuraciones de API no encontradas.',
    detail: 'Actualiza la página e inténtalo de nuevo. Si el error persiste, contacta con soporte.'
  },
  {
    error: 'ERR_NO_CONTACT_FOUND',
    description: 'Contacto no encontrado en el sistema.',
    detail: 'Verifica si el número realmente está guardado correctamente en el sistema o registra el contacto.'
  },
  {
    error: 'ERR_DUPLICATED_CONTACT',
    description: 'Contacto ya registrado en el sistema.',
    detail: 'Localiza el contacto ya registrado.'
  },
  {
    error: 'ERR_CONTACT_TICKETS_REGISTERED',
    description: 'El contacto no puede ser eliminado.',
    detail: 'El contacto tiene atenciones registradas y no puede ser eliminado para garantizar la integridad de la información.'
  },
  {
    error: 'ERR_CREATING_MESSAGE',
    description: 'El mensaje no fue creado.',
    detail: 'Verifica si la conexión con Whatsapp está activa o si el mensaje no infringió los términos de Whatsapp.'
  },
  {
    error: 'ERR_NO_TICKET_FOUND',
    description: 'Atención no encontrada.',
    detail: 'No localizamos la atención informada. Actualiza la página (F5) e inténtalo de nuevo. Consulta soporte si el error persiste.'
  },
  {
    error: 'ERR_AUTO_REPLY_RELATIONED_TICKET',
    description: 'No es posible eliminar el registro.',
    detail: 'El flujo ya fue utilizado en varias atenciones.'
  },
  {
    error: 'ERR_NO_AUTO_REPLY_FOUND',
    description: 'Flujo informado no encontrado.',
    detail: 'Verifica si el flujo realmente existe. Actualiza la página e inténtalo de nuevo.'
  },
  {
    error: 'ERR_NO_STEP_AUTO_REPLY_FOUND',
    description: 'No se encontró etapa para el flujo.',
    detail: 'Verifica el registro de las etapas del chatbot. Confirma si la etapa realmente existe.'
  },
  {
    error: 'ERR_CAMPAIGN_CONTACTS_NOT_EXISTS_OR_NOT_ACESSIBLE',
    description: 'La campaña no existe o no está accesible.',
    detail: 'Verifica si la campaña aún existe o si está disponible.'
  },
  {
    error: 'ERROR_CAMPAIGN_NOT_EXISTS',
    description: 'Campaña no encontrada.',
    detail: 'Verifica si la campaña aún existe o si está disponible.'
  },
  {
    error: 'ERR_NO_CAMPAIGN_FOUND',
    description: 'Campaña no encontrada.',
    detail: 'Verifica si la campaña aún existe o si está disponible.'
  },
  {
    error: 'ERR_NO_UPDATE_CAMPAIGN_NOT_IN_CANCELED_PENDING',
    description: 'La campaña no está cancelada o pendiente.',
    detail: 'Solo campañas en los estados mencionados pueden ser modificadas.'
  },
  {
    error: 'ERROR_CAMPAIGN_DATE_NOT_VALID',
    description: 'Fecha de programación inválida.',
    detail: 'La fecha debe ser mayor que la fecha actual.'
  },
  {
    error: 'ERR_NO_CAMPAIGN_CONTACTS_NOT_FOUND',
    description: 'La campaña no existe.',
    detail: 'La campaña no fue encontrada. Actualiza la página.'
  },
  {
    error: 'ERR_CAMPAIGN_CONTACTS_NOT_EXISTS',
    description: 'La campaña no existe. Contactos no vinculados.',
    detail: 'Posiblemente la campaña ya fue eliminada y no existen contactos vinculados. Actualiza la página.'
  },
  {
    error: 'ERR_CAMPAIGN_CONTACTS',
    description: 'Problema con la campaña.',
    detail: 'Actualiza la página e inténtalo de nuevo.'
  },
  {
    error: 'ERR_NO_FAST_REPLY_FOUND',
    description: 'Respuesta rápida no encontrada.',
    detail: 'Verifica si el registro realmente existe. Actualiza la página e inténtalo de nuevo.'
  },
  {
    error: 'ERR_FAST_REPLY_EXISTS',
    description: 'Respuesta rápida no existe.',
    detail: 'Posiblemente el registro ya fue eliminado. Actualiza la página.'
  },
  {
    error: 'ERR_NO_QUEUE_FOUND',
    description: 'Cola no encontrada.',
    detail: 'Posiblemente el registro ya fue eliminado. Actualiza la página.'
  },
  {
    error: 'ERR_QUEUE_TICKET_EXISTS',
    description: 'La cola tiene atenciones vinculadas.',
    detail: 'No es posible eliminar el registro para mantener la integridad de la información.'
  },
  {
    error: 'ERR_NO_TAG_FOUND',
    description: 'Etiqueta no encontrada.',
    detail: 'Posiblemente el registro ya fue eliminado. Actualiza la página.'
  },
  {
    error: 'ERR_TAG_CONTACTS_EXISTS',
    description: 'Etiqueta tiene contactos vinculados.',
    detail: 'No es posible eliminar el registro para mantener la integridad de la información.'
  },
  {
    error: 'ERR_NO_SETTING_FOUND',
    description: 'Configuración no existe.',
    detail: 'Actualiza la página e inténtalo de nuevo. Consulta soporte si el error persiste.'
  },
  {
    error: 'ERR_NO_TENANT_FOUND',
    description: 'No localizamos empresa registrada o activa.',
    detail: 'Actualiza la página e inténtalo de nuevo. Consulta soporte si el error persiste.'
  },
  {
    error: 'ERR_CREATING_TICKET',
    description: 'No fue posible crear la atención.',
    detail: 'Actualiza la página e inténtalo de nuevo. Consulta soporte si el error persiste.'
  },
  {
    error: 'ERR_NO_STATUS_SELECTED',
    description: 'Ningún estado seleccionado.',
    detail: 'Es necesario seleccionar estado para listar las atenciones.'
  },
  {
    error: 'ERR_INVALID_CREDENTIALS',
    description: 'Usuario y/o contraseña inválidos.',
    detail: 'Los datos de inicio de sesión son inválidos. Si el problema persiste, contacta a un administrador del sistema para restablecer las credenciales.'
  },
  {
    error: 'ERR_NO_USER_FOUND',
    description: 'Usuario no encontrado.',
    detail: 'Verifica si el usuario realmente existe. Actualiza la página si es necesario.'
  },
  {
    error: 'ERR_WAPP_INVALID_CONTACT',
    description: 'El número informado en el contacto es inválido',
    detail: 'El número no es un contacto vinculado a una cuenta de Whatsapp.'
  },
  {
    error: 'ERR_WAPP_CHECK_CONTACT',
    description: 'Ocurrió un error al validar el contacto por Whatsapp.',
    detail: 'Verifica si la conexión con Whatsapp está activa. Si es necesario, actualiza la página e inténtalo nuevamente en unos instantes.'
  },
  {
    error: 'ERR_DELETE_WAPP_MSG',
    description: 'Whatsapp no permitió eliminar el mensaje.',
    detail: 'No es posible eliminar mensajes antiguos. Si el mensaje es de las últimas 24h, verifica si la conexión con Whatsapp está activa. Si es necesario, actualiza la página e inténtalo nuevamente en unos instantes.'
  },
  {
    error: 'ERR_SENDING_WAPP_MSG',
    description: 'Mensaje no enviado por Whatsapp.',
    detail: 'Verifica si la conexión con Whatsapp está activa. Si es necesario, actualiza la página e inténtalo nuevamente en unos instantes.'
  },
  {
    error: 'ERR_WAPP_NOT_INITIALIZED',
    description: 'Sesión con Whatsapp no inicializada',
    detail: 'Validar el estado de conexión con WhatsApp.'
  },
  {
    error: 'ERR_CONTACTS_NOT_EXISTS_WHATSAPP',
    description: 'El contacto no existe en Whatsapp.',
    detail: 'El número no es un contacto válido para Whatsapp.'
  },
  {
    error: 'ERR_NO_WAPP_FOUND',
    description: 'Sesión no encontrada.',
    detail: 'Verifica si el registro realmente existe. Si es necesario, actualiza la página.'
  },
  {
    error: 'ERR_OTHER_OPEN_TICKET',
    description: 'Ya existe una atención abierta para el contacto.',
    detail: 'Localiza el contacto en la lista de atenciones.'
  },
  {
    error: 'ERR_NO_DEF_WAPP_FOUND',
    description: 'No existe una conexión marcada como "PREDETERMINADA".',
    detail: 'Es necesario realizar la definición en el menú de sesiones.'
  },
  {
    error: 'ERR_FETCH_WAPP_MSG',
    description: 'No se pueden encontrar los mensajes.',
    detail: 'Validar el estado de conexión con WhatsApp.'
  },
  {
    error: 'ERROR_LOS_MENSAJES_DE_USUARIO_NO_EXISTEN',
    description: 'No se puede eliminar el usuario.',
    detail: 'Los usuarios que tienen conversaciones no pueden ser eliminados.'
  },
  {
    error: 'ERR_EMPRESA_NO_ACTIVA',
    description: 'No se puede iniciar sesión en la empresa inactiva.',
    detail: 'Consulte con su administrador del sistema.'
  },
  {
    error: 'ERR_NO_PERMISSION',
    description: 'Usuario sin permiso.',
    detail: 'Su usuario no tiene permiso para realizar la acción.'
  }
]

export default errors
