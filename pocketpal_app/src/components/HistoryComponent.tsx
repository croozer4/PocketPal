import {Accordion, MantineProvider} from '@mantine/core';
import { format } from 'date-fns';

type Expense = {
  id: string;
  category: string;
  creationDate: Date;
  description?: string;
  type: boolean;
  user: string;
  value: number;
}

const PeekDetails = (item: Expense) => {
  // Formatowanie daty przy użyciu date-fns
  const dateFormatted = format(Number(item.creationDate), "dd/MM/yyyy HH:mm:ss");

  return (
    <Accordion.Item key={item.id} value={item.id}>
      <Accordion.Control>{item.category} | {item.value}zł ({dateFormatted})</Accordion.Control>
      <Accordion.Panel>{item.description}</Accordion.Panel>
    </Accordion.Item>
  );
}


const HistoryComponent = ({data}: { data: Array<Expense> }) => {
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