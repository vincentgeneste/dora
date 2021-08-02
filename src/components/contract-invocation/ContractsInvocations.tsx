import React, { ReactElement, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'

import { MOCK_CONTRACTS_INVOCATIONS_DATA } from '../../utils/mockData'
import List from '../../components/list/List'
import './ContractsInvocations.scss'
import { State as ContractState } from '../../reducers/contractReducer'
import { fetchContractsInvocations } from '../../actions/contractActions'
import useWindowWidth from '../../hooks/useWindowWidth'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants'
import Filter, { Platform } from '../filter/Filter'
import useFilterState from '../../hooks/useFilterState'

type Invocation = {
  name: string
  hash: string
  count: number
  change: string
}

type ParsedInvocation = {
  contract: React.FC<{}>
  count: React.FC<{}>
  change: React.FC<{}>
}

const mapInvocationData = (
  invocation: Invocation,
  total: number,
  position: number,
): ParsedInvocation => {
  const percentage = Math.floor((invocation.count / total) * 100)
  return {
    contract: (): ReactElement => (
      <Link
        // BUGBUG this should come from state or get passed as a prop
        to={`${ROUTES.CONTRACT.url}/neo2/mainnet/${invocation.hash}`}
        className="invocation-name-container"
      >
        <div className="invocation-position">{position + 1}</div>
        <div className="invocation-name">{invocation.name}</div>
        <div className="invocation-count-bar">
          <div
            className="invocation-count-bar-count-color"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </Link>
    ),
    count: (): ReactElement => (
      <div className="invocation-count">
        {invocation.count.toLocaleString()}
      </div>
    ),
    change: (): ReactElement => (
      <div className="invocation-change">
        {invocation.change[0] === '+' ? (
          <ArrowUpwardIcon style={{ color: '#00F5B2', height: '22px' }} />
        ) : (
          <ArrowDownwardIcon style={{ color: '#D355E7' }} />
        )}
        {invocation.change}%
      </div>
    ),
  }
}

const returnBlockListData = (
  data: Array<Invocation>,
  returnStub: boolean,
): Array<ParsedInvocation> => {
  if (returnStub) {
    return MOCK_CONTRACTS_INVOCATIONS_DATA.map((invocation, i) =>
      mapInvocationData(invocation, 0, i),
    ).slice(0, 5)
  } else {
    const totalTransactions =
      data.length && data.reduce((a, b) => a + b.count, 0)
    return data
      .map((invocation, i) =>
        mapInvocationData(invocation, totalTransactions, i),
      )
      .slice(0, 5)
  }
}

const ContractsInvocations: React.FC<{}> = () => {
  const dispatch = useDispatch()
  const contractState = useSelector(
    ({ contract }: { contract: ContractState }) => contract,
  )
  const { contractsInvocations, isLoading } = contractState
  const width = useWindowWidth()

  const { protocol, handleSetFilterData, network } = useFilterState()
  const selectedData = (): Array<any> => {
    console.log('filtering', contractsInvocations)
    if (protocol === 'all' && network === 'all') {
      return contractsInvocations
    } else if (protocol === 'all' && network !== 'all') {
      return contractsInvocations.filter(d => d.network === network)
    } else if (protocol !== 'all' && network === 'all') {
      return contractsInvocations.filter(d => d.protocol === protocol)
    } else {
      return contractsInvocations.filter(
        d => d.protocol === protocol && d.network === network,
      )
    }
  }

  useEffect(() => {
    if (!contractsInvocations.length) dispatch(fetchContractsInvocations())
  }, [contractsInvocations, dispatch])

  const columns =
    width > 768
      ? [
          {
            name: 'Contracts',
            accessor: 'contract',
          },
          { name: 'Transactions', accessor: 'count' },
          { name: '24 hr change', accessor: 'change' },
        ]
      : [
          {
            name: 'Contracts',
            accessor: 'contract',
          },
          { name: 'Transactions', accessor: 'count' },
        ]

  return (
    <div>
      <div className="label-wrapper">
        <label>Contract Invocations in the last 24 hours</label>
        <Filter
          handleFilterUpdate={(option): void => {
            handleSetFilterData({
              protocol: (option.value as Platform).protocol,
              network: (option.value as Platform).network,
            })
          }}
        />
      </div>
      <div
        id="ContractInvocations"
        className={width > 768 ? '' : 'mobile-contract-invocations'}
      >
        <List
          data={returnBlockListData(selectedData(), isLoading)}
          rowId="index"
          withoutPointer
          isLoading={isLoading}
          columns={columns}
        />
      </div>
    </div>
  )
}

export default ContractsInvocations
