import React, { useEffect, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { fetchTransaction } from './AddressTransactionService'
import './AddressTransactions.scss'
import {
  AddressTransaction,
  Notification,
  Transfer,
} from './AddressTransaction'
import Button from '../../../../components/button/Button'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import { byteStringToAddress, GENERATE_BASE_URL } from '../../../../constants'
import { convertToArbitraryDecimals } from '../../../../utils/formatter'
import AddressTransactionsCard from './fragments/AddressTransactionCard'

interface MatchParams {
  hash: string
  chain: string
  network: string
}

type Props = RouteComponentProps<MatchParams>

const AddressTransactions: React.FC<Props> = (props: Props) => {
  const { chain, network, hash } = props.match.params
  const [transactions, setTransactions] = useState([] as AddressTransaction[])
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const populateRecords = (items: AddressTransaction[]) => {
    setTransactions([...transactions, ...items])
    setIsLoading(false)
  }

  const loadMore = (): void => {
    setCurrentPage(currentPage + 1)
  }

  const getTransfers = (invocations: Notification[]) =>
    Promise.all(
      invocations
        .filter(
          ({ state, event_name }) =>
            state.length === 3 && event_name === 'Transfer',
        )
        .map(async ({ contract, state }): Promise<Transfer> => {
          const [{ value: from }, { value: to }, { value: amount }] = state

          const response = await fetch(
            `${GENERATE_BASE_URL()}/asset/${contract}`,
          )

          const json = await response.json()
          const { name, symbol, decimals } = json

          const convertedAmount = convertToArbitraryDecimals(
            Number(amount),
            decimals,
          )
          const convertedFrom = byteStringToAddress(from)
          const convertedTo = byteStringToAddress(to)

          return {
            scripthash: contract,
            from: convertedFrom,
            to: convertedTo,
            amount: convertedAmount,
            name,
            icon: symbol,
          }
        }),
    )

  useEffect(() => {
    setIsLoading(true)
    const populate = async () => {
      const { items = [], totalCount } = await fetchTransaction(
        hash,
        currentPage,
      )

      for (const item of items) {
        item.transfers = await getTransfers(item.notifications)
      }

      populateRecords(items)

      if (pages === 0 && items.length > 0) {
        setPages(Math.ceil(totalCount / items.length))
      }
    }

    if (hash) {
      populate()
    }
  }, [chain, network, hash, currentPage])

  return (
    <div
      id="addressTransactions"
      className="page-container address-transactions"
    >
      <div className="address-transactions__table">
        {transactions.length > 0
          ? transactions.map(it => (
              <AddressTransactionsCard
                key={it.hash}
                transaction={it}
                chain={chain}
                network={network}
              />
            ))
          : !isLoading && (
              <div className="horiz justify-center">
                <p>not found transactions</p>
              </div>
            )}

        {isLoading && (
          <SkeletonTheme
            color="#21383d"
            highlightColor="rgb(125 159 177 / 25%)"
          >
            <Skeleton count={15} style={{ margin: '5px 0', height: '100px' }} />
          </SkeletonTheme>
        )}

        {currentPage < pages && (
          <div className="load-more-button-container">
            <Button disabled={isLoading} primary={false} onClick={loadMore}>
              load more
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default withRouter(AddressTransactions)
