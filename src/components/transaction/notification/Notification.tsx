import React, { ReactElement, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import ExpandingPanel from '../../panel/ExpandingPanel'
import { TransactionNotification } from '../../../reducers/transactionReducer'
import { Box, Collapse, Flex, Text } from '@chakra-ui/react'
import Copy from '../../copy/Copy'
import { NotificationPanel } from './fragment/NotificationPanel'
import { GENERATE_BASE_URL, ROUTES } from '../../../constants'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import { DetailedContract } from '../../../reducers/contractReducer'
import { uuid } from '../../../utils/formatter'

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
    setItems(notifications)

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
                  <Flex flexDir={'column'}>
                    <Text
                      fontWeight={500}
                      color={'white'}
                      fontSize={'md'}
                      mb={1}
                    >
                      {notification.contractObj?.manifest?.name}
                    </Text>
                    <Text
                      fontWeight={500}
                      color={'white'}
                      fontSize={'md'}
                      display={['inline', 'none']}
                    >
                      {notification.event_name}
                    </Text>
                  </Flex>
                  <Flex alignItems={'center'}>
                    <Text
                      fontWeight={500}
                      color={'white'}
                      fontSize={'md'}
                      display={['none', 'inline']}
                    >
                      {notification.event_name}
                    </Text>
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

                <Flex
                  justifyContent={'space-between'}
                  py={2}
                  flexDir={['column', 'row']}
                >
                  <Flex justifyContent={'space-between'}>
                    <Text color={'medium-grey'} fontSize={'xs'}>
                      HASH
                    </Text>

                    <Text display={['inline', 'none']}>
                      <Copy text={notification.contract} />
                    </Text>
                  </Flex>

                  <Flex
                    alignItems={'center'}
                    overflow={'hidden'}
                    flex={1}
                    justifyContent={'end'}
                  >
                    <Text
                      fontSize={'sm'}
                      isTruncated
                      textOverflow={'clip'}
                      color={'tertiary'}
                      fontWeight={500}
                    >
                      <Link
                        to={`${ROUTES.CONTRACT.url}/${chain}/${network}/${notification.contract}`}
                      >
                        {notification.contract}
                      </Link>
                    </Text>
                    <Text display={['none', 'inline']} mx={1}>
                      <Copy text={notification.contract} />
                    </Text>
                  </Flex>
                </Flex>
              </Box>

              <Collapse in={isOpen[notification.id]}>
                <NotificationPanel
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
