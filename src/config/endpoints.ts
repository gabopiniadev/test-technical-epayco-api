export const API_ENDPOINTS = {
  RECHARGE_WALLET: 'http://localhost:4000/api/db/wallet/recharge',
  PAYMENT: 'http://localhost:4000/api/db/wallet/payment',
  PAYMENT_CONFIRM: 'http://localhost:4000/api/db/wallet/payment/confirm',
  BALANCE: 'http://localhost:4000/api/db/wallet/balance',
  CUSTOMER_WALLET_INFO: 'http://localhost:4000/api/db/wallet/info',
  WALLET_TRANSACTIONS: 'http://localhost:4000/api/db/transaction/wallet',

  CUSTOMER_REGISTER: 'http://localhost:4000/api/db/customer',
  USER_REGISTER: 'http://localhost:4000/api/db/user',
  WALLET_CREATE: 'http://localhost:4000/api/db/wallet',
  AUTH_LOGIN: 'http://localhost:4000/api/db/auth/login',
  USER_INFO: 'http://localhost:4000/api/db/user/info',

};

export const ERROR_MESSAGES = {
  DATABASE_CONNECTION: 'Error al conectar con el servicio de base de datos.',
  TRANSACTION_ERROR: 'Error al procesar la transacción.',
  PAYMENT_CONFIRMATION_FAILED: 'Error al confirmar el pago.',
  REQUIRED_FIELDS: 'Todos los campos son obligatorios.',
  INVALID_TRANSACTION_ID: 'El ID de transacción no es válido.',
};

export const SUCCESS_MESSAGES = {
  RECHARGE_SUCCESS: 'Recarga realizada exitosamente.',
  PAYMENT_INITIATED: 'Pago iniciado correctamente.',
  PAYMENT_CONFIRMED: 'Pago confirmado exitosamente.',
  TRANSACTION_HISTORY: 'Historial de transacciones obtenido.',
  BALANCE_QUERY: 'Saldo consultado exitosamente.',
};
