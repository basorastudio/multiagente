const backendErrors = {
  ERR_NO_DEF_WAPP_FOUND:
    'Ningún WhatsApp por defecto encontrado. Verifique la página de conexiones.',
  ERR_WAPP_NOT_INITIALIZED:
    'Esta sesión de WhatsApp no fue inicializada. Verifique la página de conexione.',
  ERR_WAPP_INITIALIZED:
    'No está conectado con WhatsApp. Estamos reiniciando la conexión. Inténtelo nuevamente en algunos segundos.',
  ERR_WAPP_CHECK_CONTACT:
    'No fue posible verificar el contacto de WhatsApp. Verifique la página de conexione',
  ERR_WAPP_INVALID_CONTACT: 'Este no es un número de WhatsApp válido.',
  ERR_WAPP_DOWNLOAD_MEDIA:
    'No fue posible descargar media de WhatsApp. Verifique la página de conexione.',
  ERR_INVALID_CREDENTIALS:
    'Error de autenticación. Por favor, inténtelo nuevamente.',
  ERR_SENDING_WAPP_MSG:
    'Error al enviar mensaje de WhatsApp. Verifique la página de conexione.',
  ERR_DELETE_WAPP_MSG: 'No fue posible eliminar el mensaje de WhatsApp.',
  ERR_OTHER_OPEN_TICKET: 'Ya existe un Ticket abierto para este contacto.',
  ERR_SESSION_EXPIRED: 'Sesión expirada. Por favor ingrese.',
  ERR_USER_CREATION_DISABLED:
    'La creación del usuario fue deshabilitada por el administrador.',
  ERR_NO_PERMISSION: 'Usted no tiene permiso para acceder a este recurso.',
  ERR_DUPLICATED_CONTACT: 'Ya existe un contacto con este número.',
  ERR_NO_SETTING_FOUND: 'Ninguna configuración encontrada con este ID.',
  ERR_NO_CONTACT_FOUND: 'Ningún contacto encontrado con este ID.',
  ERR_NO_TICKET_FOUND: 'Ningún Ticket encontrado con este ID.',
  ERR_NO_USER_FOUND: 'Ningún usuario encontrado con este ID.',
  ERR_NO_WAPP_FOUND: 'Ningún WhatsApp encontrado con este ID.',
  ERR_CREATING_MESSAGE: 'Error al crear mensaje en la base de datos.',
  ERR_CREATING_TICKET: 'Error al crear Ticket en la base de datos.',
  ERR_COMPANY_NOT_ACTIVE: 'No fue posible hacer login empresa Inactiva.',
  ERR_FETCH_WAPP_MSG:
    'Error al buscar el mensaje en WhatsApp, tal vez sea muy antiguo.'
}

export default backendErrors
