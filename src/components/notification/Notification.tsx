import React, { ReactElement, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import ExpandingPanel from '../panel/ExpandingPanel'
import { TransactionNotification } from '../../reducers/transactionReducer'
import { Box, Collapse, Flex, Text } from '@chakra-ui/react'
import Copy from '../copy/Copy'
import { NotificationPanel } from './fragment/NotificationPanel'
import { GENERATE_BASE_URL } from '../../constants'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import { DetailedContract } from '../../reducers/contractReducer'
import { uuid } from '../../utils/formatter'

export const Notification: React.FC<{
  notifications: TransactionNotification[]
  chain: string
  network: string
}> = ({ notifications, chain, network }): ReactElement => {
  const [isOpen, setOpen] = useState<Record<string, boolean>>({})
  const [isLoading, setLoading] = useState<boolean>(false)
  const [items, setItems] = useState<TransactionNotification[]>([])
  const [contracts, setContracts] = useState<Record<string, DetailedContract>>(
    {},
  )

  useEffect(() => {
    const groupedItems = notifications.reduce((result, it) => {
      const found = result.find(
        item =>
          item.contract === it.contract && item.event_name === it.event_name,
      )
      if (found) {
        found.state.value.push(...it.state.value)
        return result
      }

      result.push(it)
      return result
    }, [] as TransactionNotification[])

    setItems(groupedItems)

    return () => {
      setItems([])
      setContracts({})
    }
  }, [notifications])

  const populateContract = async () => {
    try {
      setLoading(true)
      for (const it of items) {
        const id = uuid()
        it.id = id
        setOpen(val => ({ ...val, [id]: false }))

        if (!!contracts[it.contract]) {
          it.contractObj = contracts[it.contract]
          continue
        }

        const response = await fetch(
          `${GENERATE_BASE_URL()}/contract/${it.contract}`,
        )
        it.contractObj = await response.json()

        setContracts(current => ({
          ...current,
          [it.contract]: it.contractObj,
        }))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box my={3}>
      <ExpandingPanel
        title={<Text>NOTIFICATIONS</Text>}
        open={false}
        handleClick={(isOpen: boolean) => isOpen && populateContract()}
      >
        {isLoading && (
          <SkeletonTheme
            color="#21383d"
            highlightColor="rgb(125 159 177 / 25%)"
          >
            <Skeleton
              count={items.length}
              style={{ margin: '5px 0', height: '40px' }}
            />
          </SkeletonTheme>
        )}
        {!isLoading &&
          items.map((notification, index) => (
            <Box key={notification.id + index}>
              <Box bg={'medium-grey-blue'} mt={3} px={3}>
                <Flex
                  justifyContent={'space-between'}
                  py={2}
                  borderBottom={'2px solid'}
                  borderColor={'gray.600'}
                  cursor={'pointer'}
                  alignItems={'center'}
                  onClick={() =>
                    setOpen({
                      ...isOpen,
                      [notification.id]: !isOpen[notification.id],
                    })
                  }
                >
                  <Text>{notification.contractObj?.manifest?.name}</Text>
                  <Flex alignItems={'center'}>
                    <Text>{notification.event_name}</Text>
                    {isOpen[notification.id] ? (
                      <Text mx={2} color={'tertiary'} fontSize={'4xl'}>
                        -
                      </Text>
                    ) : (
                      <Text mx={2} color={'tertiary'} fontSize={'4xl'}>
                        +
                      </Text>
                    )}
                  </Flex>
                </Flex>

                <Flex justifyContent={'space-between'} py={2}>
                  <Text color={'medium-grey'} fontSize={'xs'}>
                    HASH
                  </Text>

                  <Flex alignItems={'center'}>
                    <Link
                      to={`/contract/${chain}/${network}/${notification.contract}`}
                    >
                      <Text
                        fontSize={'sm'}
                        isTruncated
                        color={'tertiary'}
                        mx={8}
                        fontWeight={500}
                      >
                        {notification.contract}
                      </Text>
                    </Link>

                    <Copy text={notification.contract} />
                  </Flex>
                </Flex>
              </Box>

              <Collapse in={isOpen[notification.id]}>
                <NotificationPanel
                  key={index}
                  chain={chain}
                  state={notification.state}
                  parameters={
                    notification.contractObj?.manifest?.abi?.events
                      ?.find(it => it.name === notification.event_name)
                      ?.parameters.map(it => it.name) || []
                  }
                />
              </Collapse>
            </Box>
          ))}
      </ExpandingPanel>
    </Box>
  )
}

export default Notification
