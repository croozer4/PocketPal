import {Accordion, MantineProvider} from '@mantine/core';

type record = {
  id: string,
  category: string,
  price: number,
  date: string,
  description: string
}

const data = [
  {
    id: "1",
    category: 'Jedzenie',
    price: 10.00,
    date: '2021-01-01',
    description: 'Kupiłem burgera'
  },
  {
    id: "2",
    category: 'Jedzenie',
    price: 5.00,
    date: '2021-01-02',
    description: 'Kupiłem napój'
  },
  {
    id: "3",
    category: 'Rachunki',
    price: 100.00,
    date: '2021-01-03',
    description: 'Zapłaciłem za prąd'
  },
  {
    id: "4",
    category: 'Rozrywka',
    price: 20.00,
    date: '2021-01-04',
    description: 'Byłem w kinie'
  }
]

const PeekDetails = (item: record) => {
  return (
    <Accordion.Item key={item.id} value={item.id}>
      <Accordion.Control>{item.category} | {item.price}zł ({item.date})</Accordion.Control>
      <Accordion.Panel>{item.description}</Accordion.Panel>
    </Accordion.Item>
  )
}

const HistoryComponent = () => {
  return (
    <MantineProvider theme={{ colorScheme: 'dark' }}>
      <Accordion multiple style={{ minWidth: "50vw"}}>
        {
          data.map((item) => (
            <PeekDetails key={item.id} {...item} />
          )).sort((a, b) => {
            return new Date(b.props.date).getTime() - new Date(a.props.date).getTime()
          })
        }
      </Accordion>
    </MantineProvider>
  )
}

export default HistoryComponent