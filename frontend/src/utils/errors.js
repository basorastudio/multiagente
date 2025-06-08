const errors = [
  {
    error: 'ERR_SESSION_EXPIRED',
    description: 'Su conexión ha expirado.',
    detail: 'La validez de su conexión ha expirado. Es necesario realizar un nuevo login.'
  },
  {
    error: 'ERR_API_CONFIG_NOT_FOUND',
    description: 'Configuraciones de API no localizadas.',
    detail: 'Actualice la página e intente nuevamente. Si el error persiste, contacte al soporte.'
  },
  // {
  //   error: 'ERR_CREATING_MESSAGE',
  //   description: 'Problemas ao criar a mensagem via API.',
  //   detail: 'Verifique se todas as informaçẽos requeridas foram enviadas. Tente novamente e se o erro persistir, fale com o suporte.'
  // },
  {
    error: 'ERR_NO_CONTACT_FOUND',
    description: 'Contacto no localizado en el sistema.',
    detail: 'Verifique si el número realmente está guardado en el sistema de forma correcta o registre el contacto.'
  },
  {
    error: 'ERR_DUPLICATED_CONTACT',
    description: 'Contacto ya registrado en el sistema.',
    detail: 'Localice el contacto ya registrado.'
  },
  {
    error: 'ERR_CONTACT_TICKETS_REGISTERED',
    description: 'El contacto no puede ser eliminado.',
    detail: 'El contacto posee atenciones registradas y no puede ser eliminado para garantizar la integridad de la información.'
  },
  {
    error: 'ERR_CREATING_MESSAGE',
    description: 'El mensaje no fue creado.',
    detail: 'Verifique si la conexión con WhatsApp está activa o si el mensaje no violó los términos de WhatsApp.'
  },
  {
    error: 'ERR_NO_TICKET_FOUND',
    description: 'Atención no localizada.',
    detail: 'No localizamos la atención informada. Actualice la página (F5) e intente nuevamente. Consulte al soporte si el error persiste.'
  },
  {
    error: 'ERR_AUTO_REPLY_RELATIONED_TICKET',
    description: 'No es posible eliminar el registro.',
    detail: 'El flujo ya fue utilizado en diversas atenciones.'
  },
  {
    error: 'ERR_NO_AUTO_REPLY_FOUND',
    description: 'Flujo informado no encontrado.',
    detail: 'Verifique si el flujo realmente existe. Actualice la página e intente nuevamente.'
  },
  {
    error: 'ERR_NO_STEP_AUTO_REPLY_FOUND',
    description: 'No se localizó etapa para el flujo.',
    detail: 'Verifique el registro de las etapas del chatbot. Confirme si la etapa realmente existe.'
  },
  {
    error: 'ERR_CAMPAIGN_CONTACTS_NOT_EXISTS_OR_NOT_ACESSIBLE',
    description: 'La campaña no existe o no está accesible.',
    detail: 'Verifique si la campaña aún existe o si está disponible.'
  },
  {
    error: 'ERROR_CAMPAIGN_NOT_EXISTS',
    description: 'Campaña no localizada.',
    detail: 'Verifique si la campaña aún existe o si está disponible.'
  },
  {
    error: 'ERR_NO_CAMPAIGN_FOUND',
    description: 'Campaña no localizada.',
    detail: 'Verifique si la campaña aún existe o si está disponible.'
  },
  {
    error: 'ERR_NO_UPDATE_CAMPAIGN_NOT_IN_CANCELED_PENDING',
    description: 'La campaña no está cancelada o pendiente.',
    detail: 'Solamente las campañas en los estados mencionados pueden ser alteradas.'
  },
  {
    error: 'ERROR_CAMPAIGN_DATE_NOT_VALID',
    description: 'Fecha para programación inválida.',
    detail: 'La fecha debe ser mayor que la fecha actual.'
  },
  {
    error: 'ERR_NO_CAMPAIGN_CONTACTS_NOT_FOUND',
    description: 'La campaña no existe.',
    detail: 'La campaña no fue localizada. Actualice la página.'
  },
  {
    error: 'ERR_CAMPAIGN_CONTACTS_NOT_EXISTS',
    description: 'La campaña no existe. Contactos no vinculados.',
    detail: 'Posiblemente la campaña ya fue eliminada y no existen contactos vinculados. Actualice la página.'
  },
  {
    error: 'ERR_CAMPAIGN_CONTACTS',
    description: 'Problema con la campaña.',
    detail: 'Actualice la página e intente nuevamente.'
  },
  {
    error: 'ERR_NO_FAST_REPLY_FOUND',
    description: 'Respuesta rápida no localizada.',
    detail: 'Verifique si el registro realmente existe. Actualice la página e intente nuevamente.'
  },
  {
    error: 'ERR_FAST_REPLY_EXISTS',
    description: 'La respuesta rápida no existe.',
    detail: 'Posiblemente el registro ya fue eliminado. Actualice la página.'
  },
  {
    error: 'ERR_NO_QUEUE_FOUND',
    description: 'Cola no localizada.',
    detail: 'Posiblemente el registro ya fue eliminado. Actualice la página.'
  },
  {
    error: 'ERR_QUEUE_TICKET_EXISTS',
    description: 'La cola posee atenciones vinculadas.',
    detail: 'No es posible eliminar el registro para mantener la integridad de las informaciones.'
  },
  {
    error: 'ERR_NO_TAG_FOUND',
    description: 'Etiqueta no localizada.',
    detail: 'Posiblemente el registro ya fue eliminado. Actualice la página.'
  },
  {
    error: 'ERR_TAG_CONTACTS_EXISTS',
    description: 'La etiqueta posee contactos vinculados.',
    detail: 'No es posible eliminar el registro para mantener la integridad de las informaciones.'
  },
  {
    error: 'ERR_NO_SETTING_FOUND',
    description: 'La configuración no existe.',
    detail: 'Actualice la página e intente nuevamente. Consulte al soporte si el error persiste.'
  },
  {
    error: 'ERR_NO_TENANT_FOUND',
    description: 'No localizamos empresa registrada o activa.',
    detail: 'Actualice la página e intente nuevamente. Consulte al soporte si el error persiste.'
  },
  {
    error: 'ERR_CREATING_TICKET',
    description: 'No fue posible crear la atención.',
    detail: 'Actualice la página e intente nuevamente. Consulte al soporte si el error persiste.'
  },
  {
    error: 'ERR_NO_STATUS_SELECTED',
    description: 'Ningún estado seleccionado.',
    detail: 'Es necesario seleccionar estado para listar las atenciones.'
  },
  {
    error: 'ERR_INVALID_CREDENTIALS',
    description: 'Usuario y/o contraseña inválidos.',
    detail: 'Los datos de login son inválidos. Si el problema persiste, procure un administrador del sistema para redefinición de las credenciales.'
  },
  {
    error: 'ERR_NO_USER_FOUND',
    description: 'Usuario no localizado.',
    detail: 'Verifique si el usuario realmente existe. Actualice la página si es necesario.'
  },
  {
    error: 'ERR_WAPP_INVALID_CONTACT',
    description: 'Número informado en el contacto es inválido.',
    detail: 'El número no es un contacto vinculado a una cuenta de WhatsApp.'
  },
  {
    error: 'ERR_WAPP_CHECK_CONTACT',
    description: 'Ocurrió un error al validar el contacto por WhatsApp.',
    detail: 'Verifique si la conexión con WhatsApp está activa. Si es necesario, actualice la página e intente nuevamente en algunos instantes.'
  },
  {
    error: 'ERR_DELETE_WAPP_MSG',
    description: 'WhatsApp no permitió eliminar el mensaje.',
    detail: 'No es posible eliminar mensajes antiguos. Si el mensaje es de las últimas 24h, verifique si la conexión con WhatsApp está activa. Si es necesario, actualice la página e intente nuevamente en algunos instantes.'
  },
  {
    error: 'ERR_SENDING_WAPP_MSG',
    description: 'Mensaje no enviado por WhatsApp.',
    detail: 'Verifique si la conexión con WhatsApp está activa. Si es necesario, actualice la página e intente nuevamente en algunos instantes.'
  },
  {
    error: 'ERR_WAPP_NOT_INITIALIZED',
    description: 'Sesión con WhatsApp no inicializada.',
    detail: 'Verifique el estado de la conexión con WhatsApp del sistema. Es necesario que la conexión sea establecida con éxito.'
  },
  {
    error: 'ERR_CONTACTS_NOT_EXISTS_WHATSAPP',
    description: 'El contacto no existe en WhatsApp.',
    detail: 'El número no es un contacto válido para WhatsApp.'
  },
  {
    error: 'ERR_NO_WAPP_FOUND',
    description: 'Sesión no localizada.',
    detail: 'Verifique si el registro realmente existe. Si es necesario, actualice la página.'
  },
  {
    error: 'ERR_OTHER_OPEN_TICKET',
    description: 'Ya existe una atención abierta para el contacto.',
    detail: 'Localice el contacto en la lista de atenciones.'
  },
  {
    error: 'ERR_NO_DEF_WAPP_FOUND',
    description: 'No existe una conexión marcada como "POR DEFECTO".',
    detail: 'Es necesario realizar la definición en el menú de sesiones.'
  },
  {
    error: 'ERR_FETCH_WAPP_MSG',
    description: 'No fue posible localizar mensajes.',
    detail: 'Valide el estado de conexión con WhatsApp.'
  },
  {
    error: 'ERROR_USER_MESSAGES_NOT_EXISTS',
    description: 'No fue posible eliminar el usuario.',
    detail: 'Usuarios que poseen conversaciones no pueden ser eliminados.'
  },
  {
    error: 'ERR_COMPANY_NOT_ACTIVE',
    description: 'No fue posible hacer login, empresa inactiva.',
    detail: 'Verifique con el administrador del sistema.'
  },
  {
    error: 'ERR_NO_PERMISSION',
    description: 'Usuario sin permiso.',
    detail: 'Su usuario no posee permiso para ejecutar la acción.'
  }

]

export default errors
