import { AnyAction } from 'redux'

import {
  CLEAR_TRANSACTIONS_LIST,
  REQUEST_TRANSACTION,
  REQUEST_TRANSACTION_SUCCESS,
  REQUEST_TRANSACTIONS,
  REQUEST_TRANSACTIONS_SUCCESS,
} from '../actions/transactionActions'
import { DetailedContract } from './contractReducer'

type Action = {
  type: string
  receivedAt: Date
  indexOrHash: string
  blockHeight: string
  json: {
    hash: string
  }
  page: number
  hash: string
}

export type State = {
  isLoading: boolean
  cached: { [key: string]: DetailedTransaction }
  all: Transaction[]
  lastUpdated: Date | null
  transaction: DetailedTransaction | null
  page: number
}

export type Transaction = {
  size: number
  time: number
  txid: string
  type: string
  hash?: string
  protocol?: string
  network?: string
}

export type Vin = {
  txid: string
  vout: number
}

export type Vout = {
  address: string
  asset: string
  n: number
  value: string
}

export type TransactionTokenAbstract = {
  block: number
  txid: string
  scripthash: string
  from: string
  amount: string
  time: number
  transferindex: string
  to: string
}

export type TransactionIOAbstract = {
  address: string
  asset: string
  value: string
}

export type NotificationState = {
  type: string
  value: NotificationStateValue[]
}

export type NotificationStateValue = {
  id: string
  type: string
  value: string
}

export type TransactionNotification = {
  id: string
  contract: string
  state: NotificationState
  event_name: string
  contractObj: DetailedContract
}

// TODO: create different types for the chains instead of this generic one
export type DetailedTransaction = {
  type: string
  size: string
  block: number
  time: number
  txid: string
  script: string
  scripts: [{ invocation: string; verification: string }]
  Item: {
    notifications: TransactionNotification[]
  }
  vin: Vin[]
  vout: Vout[]
  net_fee: string
  sys_fee: string
  netfee: string
  sysfee: string
  items: {
    tokens: TransactionTokenAbstract[]
    inputs: TransactionIOAbstract[]
    outputs: TransactionIOAbstract[]
  }
  sender?: string
  witnesses?: [
    {
      invocation: string
      verification: string
    },
  ]
  signers?: Signer[]
  notifications?: TransactionNotification[]
  exception?: string
}

export type Signer = {
  account: string
  scopes: string
  allowedcontracts: string[]
}

export type BlockTransaction = {
  size: number
  time: number
  txid: string
  type?: string
  hash: string
}

export const INITIAL_STATE = {
  isLoading: false,
  cached: {},
  all: [],
  lastUpdated: null,
  transaction: null,
  page: 1,
}

export default (
  state: State = INITIAL_STATE,
  action: AnyAction | Action,
): State => {
  switch (action.type) {
    case REQUEST_TRANSACTION:
      return Object.assign({}, state, {
        isLoading: true,
        transaction: null,
      })
    case REQUEST_TRANSACTIONS:
      return Object.assign({}, state, {
        isLoading: true,
      })
    case REQUEST_TRANSACTION_SUCCESS:
      return Object.assign({}, state, {
        isLoading: false,
        transaction: action.json,
        lastUpdated: action.receivedAt,
        cached: {
          [action.hash]: action.json,
          ...state.cached,
        },
      })
    case REQUEST_TRANSACTIONS_SUCCESS:
      return Object.assign({}, state, {
        isLoading: false,
        all: [...state.all, ...action.json.all.items],
        totalCount: action.json.totalCount,
        lastUpdated: action.receivedAt,
        page: action.page,
      })
    case CLEAR_TRANSACTIONS_LIST:
      return Object.assign({}, state, {
        all: [],
        page: 0,
      })
    case 'RESET':
      // eslint-disable-next-line
      // @ts-ignore
      return INITIAL_STATE
    default:
      return state
  }
}
