import { ResponsivePie } from '@nivo/pie';
import {useEffect, useState} from "react";
import { getDocs } from '@firebase/firestore';
import {auth, db} from "../config/firebase.tsx";
import {collection, query, where} from "firebase/firestore";
import {toast} from "react-toastify";
import {DefaultAlertTime} from "../config/globals.tsx";

type Expense = {
  id: string;
  category: string;
  creationDate: Date;
  description?: string;
  type: boolean;
  user: string;
  value: number;
}

function BasicPieChart() {
  const [data, setData] = useState<Expense[]>();

  const categories = [
    {
      "id": "hack",
      "label": "hack",
      "value": 13,
      "color": "hsl(262, 70%, 50%)"
    },
    {
      "id": "haskell",
      "label": "haskell",
      "value": 213,
      "color": "hsl(100, 70%, 50%)"
    },
    {
      "id": "php",
      "label": "php",
      "value": 208,
      "color": "hsl(41, 70%, 50%)"
    },
    {
      "id": "python",
      "label": "python",
      "value": 24,
      "color": "hsl(93, 70%, 50%)"
    },
    {
      "id": "java",
      "label": "java",
      "value": 45,
      "color": "hsl(314, 70%, 50%)"
    }
  ];

  const [reload, setReload] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      // pobierz wszystkie dokumenty z kolekcji 'usersData' z katalogu danego użytkownika
      const uid = auth.currentUser?.uid || null;

      if(uid) {
        const q = query(collection(db, 'usersData'), where('user', '==', uid));
        const querySnapshot = await getDocs(q);

        const fetchedData : Expense[] = [];

        if(querySnapshot) {
          querySnapshot.forEach((doc) => {
            const docData = doc.data();
            fetchedData.push({
              id: doc.id,
              category: docData.category,
              creationDate: docData.creationDate,
              description: docData.description,
              type: docData.type,
              user: docData.user,
              value: docData.value,
            });
          });
          setData(fetchedData);
          console.log(fetchedData);
        }
        setReload(true);
      }
    } catch (error) {
      toast.error('Nie udało się pobrać danych!', {
        position: "top-center",
        autoClose: DefaultAlertTime,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  }

  useEffect(() => {
    if(reload) {
      auth.onAuthStateChanged((user) => {
        if (user) {
          fetchData().then(() => {
            setReload(false);
          });
        }
      });
    }
  }, [reload]);

  return (
    <div style={{ height: "400px", width: "400px"}}>
      <h5 style={{ marginBottom:0}}>Podsumowanie</h5>
      <ResponsivePie
        data={categories}
        margin={{ top: 40, right: 100, bottom: 80, left: 100 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{
          from: 'color',
          modifiers: [
            [
              'darker',
              0.2
            ]
          ]
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#FFFFFF"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [
            [
              'darker',
              2
            ]
          ]
        }}
        defs={[
          {
            id: 'dots',
            type: 'patternDots',
            background: 'inherit',
            color: 'rgba(255, 255, 255, 0.3)',
            size: 2,
            padding: 1,
            stagger: true
          },
          {
            id: 'lines',
            type: 'patternLines',
            background: 'inherit',
            color: 'rgba(255, 255, 255, 0.3)',
            rotation: -45,
            lineWidth: 6,
            spacing: 10
          }
        ]}
        fill={[
          {
            match: {
              id: 'ruby'
            },
            id: 'dots'
          },
          {
            match: {
              id: 'c'
            },
            id: 'dots'
          },
          {
            match: {
              id: 'go'
            },
            id: 'dots'
          },
          {
            match: {
              id: 'python'
            },
            id: 'dots'
          },
          {
            match: {
              id: 'scala'
            },
            id: 'lines'
          },
          {
            match: {
              id: 'lisp'
            },
            id: 'lines'
          },
          {
            match: {
              id: 'elixir'
            },
            id: 'lines'
          },
          {
            match: {
              id: 'javascript'
            },
            id: 'lines'
          }
        ]}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 0,
            itemWidth: 80,
            itemHeight: 18,
            itemTextColor: '#EEEEEE',
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: '#CCCCCC'
                }
              }
            ]
          }
        ]}
      />
    </div>
  )
}

export default BasicPieChart;
