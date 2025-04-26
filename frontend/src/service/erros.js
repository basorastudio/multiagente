const backendErrors = {
  ERR_NO_DEF_WAPP_FOUND:
    'No se encontró WhatsApp predeterminado. Verifique la página de conexiones.',
  ERR_WAPP_NOT_INITIALIZED:
    'Esta sesión de WhatsApp no ha sido inicializada. Verifique la página de conexiones.',
  ERR_WAPP_INITIALIZED:
    'No está conectado con WhatsApp. Estamos reiniciando la conexión. Intente nuevamente en unos segundos.',
  ERR_WAPP_CHECK_CONTACT:
    'No se pudo verificar el contacto de WhatsApp. Verifique la página de conexiones',
  ERR_WAPP_INVALID_CONTACT: 'Este no es un número de WhatsApp válido.',
  ERR_WAPP_DOWNLOAD_MEDIA:
    'No se pudo descargar multimedia de WhatsApp. Verifique la página de conexiones.',
  ERR_INVALID_CREDENTIALS:
    'Error de autenticación. Por favor, intente nuevamente.',
  ERR_SENDING_WAPP_MSG:
    'Error al enviar mensaje de WhatsApp. Verifique la página de conexiones.',
  ERR_DELETE_WAPP_MSG: 'No se pudo eliminar el mensaje de WhatsApp.',
  ERR_OTHER_OPEN_TICKET: 'Ya existe un Ticket abierto para este contacto.',
  ERR_SESSION_EXPIRED: 'Sesión expirada. Por favor ingrese.',
  ERR_USER_CREATION_DISABLED:
    'La creación de usuario ha sido deshabilitada por el administrador.',
  ERR_NO_PERMISSION: 'No tiene permiso para acceder a este recurso.',
  ERR_DUPLICATED_CONTACT: 'Ya existe un contacto con este número.',
  ERR_NO_SETTING_FOUND: 'No se encontró configuración con este ID.',
  ERR_NO_CONTACT_FOUND: 'No se encontró contacto con este ID.',
  ERR_NO_TICKET_FOUND: 'No se encontró Ticket con este ID.',
  ERR_NO_USER_FOUND: 'No se encontró usuario con este ID.',
  ERR_NO_WAPP_FOUND: 'No se encontró WhatsApp con este ID.',
  ERR_CREATING_MESSAGE: 'Error al crear mensaje en la base de datos.',
  ERR_CREATING_TICKET: 'Error al crear Ticket en la base de datos.',
  ERR_COMPANY_NOT_ACTIVE: 'No fue posible iniciar sesión, empresa Inactiva.',
  ERR_FETCH_WAPP_MSG:
    'Error al buscar el mensaje en WhatsApp, quizás es muy antiguo.'
}

export default backendErrors
