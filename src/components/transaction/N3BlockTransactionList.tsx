import React, { ReactElement } from 'react'

import { DetailedBlock } from '../../reducers/blockReducer'
import List from '../list/List'
import './BlockTransactionsList.scss'
import { BlockTransaction } from '../../reducers/transactionReducer'
import { ROUTES } from '../../constants'
import useWindowWidth from '../../hooks/useWindowWidth'
import ParsedTransactionType from './ParsedTransactionType'
import TransactionTime, { TransactionTimeProps } from './TransactionTime'

type ParsedTx = {
  time: React.FC<TransactionTimeProps>
  txid: React.FC<{}>
  size: string
  parsedType: React.FC<{}>
  hash: string
}

const mapTransactionData = (
  tx: BlockTransaction,
  block: DetailedBlock,
): ParsedTx => {
  return {
    time: (): ReactElement => <TransactionTime block_time={block.time} />,
    txid: (): ReactElement => (
      <div className="txid-index-cell"> {tx.hash} </div>
    ),
    size: `${tx.size.toLocaleString()} Bytes`,
    parsedType: (): ReactElement => <ParsedTransactionType type={'contract'} />,
    hash: tx.hash,
  }
}

const returnTxListData = (
  data: Array<BlockTransaction>,
  block: DetailedBlock,
): Array<ParsedTx> => {
  return data.map(tx => mapTransactionData(tx, block))
}

const N3BlockTransactionsList: React.FC<{
  list: Array<BlockTransaction>
  block: DetailedBlock
  loading: boolean
  network: string
  chain: string
}> = ({ list, block, loading, network, chain }) => {
  const width = useWindowWidth()

  const columns =
    width > 768
      ? [
          { name: 'Type', accessor: 'parsedType' },
          { name: 'Transaction ID', accessor: 'txid' },
          { name: 'Size', accessor: 'size' },
          { name: 'Completed on', accessor: 'time' },
        ]
      : [
          { name: 'Type', accessor: 'parsedType' },
          {
            name: 'Transaction ID',
            accessor: 'txid',
            style: { minWidth: '100px' },
          },
          { name: 'Size', accessor: 'size' },
        ]

  return (
    <div id="BlockTransactionsList">
      <List
        data={returnTxListData(list, block)}
        rowId="hash"
        generateHref={(data): string =>
          `${ROUTES.TRANSACTION.url}/${chain}/${network}/${data.id}`
        }
        isLoading={loading}
        columns={columns}
        leftBorderColorOnRow={'#4CFFB3'}
      />
    </div>
  )
}

export default N3BlockTransactionsList
