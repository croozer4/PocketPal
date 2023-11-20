import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DefaultAlertTime } from "../config/globals.tsx";
import { Timestamp } from 'firebase/firestore';
import { auth } from "../config/firebase.tsx";
import { ResponsivePie } from '@nivo/pie';
import {Text} from "@mantine/core";

type Expense = {
  id: string;
  category: string;
  creationDate: Timestamp;
  description?: string;
  type: boolean;
  user: string;
  value: number;
}

function BasicPieChart({ data }: { data: Array<Expense> }) {
  const [pieChartData, setPieChartData] = useState<number[]>([0, 0, 0, 0, 0]);
  const [shouldGenerateRandomData, setShouldGenerateRandomData] = useState(true);

  const categories = [
    {
      "id": "Jedzenie",
      "label": "Jedzenie",
      "value": pieChartData ? pieChartData[0] : 0,
      "color": "hsl(262, 70%, 50%)"
    },
    {
      "id": "Rozrywka",
      "label": "Rozrywka",
      "value": pieChartData ? pieChartData[1] : 0,
      "color": "hsl(64,91%,44%)"
    },
    {
      "id": "Transport",
      "label": "Transport",
      "value": pieChartData ? pieChartData[2] : 0,
      "color": "hsl(166,70%,50%)"
    },
    {
      "id": "Inne",
      "label": "Inne",
      "value": pieChartData ? pieChartData[3] : 0,
      "color": "hsl(314, 70%, 50%)"
    },
    {
      "id": "Opłaty",
      "label": "Opłaty",
      "value": pieChartData ? pieChartData[4] : 0,
      "color": "hsl(93,100%,46%)"
    }
  ];

  const generateRandomData = () => {
    const randomData = [];
    for (let i = 0; i < 5; i++) {
      randomData.push(Math.floor(Math.random() * 1000)); // Losowe liczby
    }
    return randomData;
  };

  useEffect(() => {
    const fetchData = (): boolean => {
      try {
        const pieChartDataTemp: number[] = [0, 0, 0, 0, 0];
        for (const item of data) {
          if (item.category === "Jedzenie") {
            pieChartDataTemp[0] += item.value;
          } else if (item.category === "Rozrywka") {
            pieChartDataTemp[1] += item.value;
          } else if (item.category === "Transport") {
            pieChartDataTemp[2] += item.value;
          } else if (item.category === "Opłaty") {
            pieChartDataTemp[3] += item.value;
          } else {
            pieChartDataTemp[4] += item.value;
          }
          setPieChartData(pieChartDataTemp);
        }
        return data.length !== 0;
      } catch (error) {
        console.error(error);
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

        return false;
      }
    }

    const updateRandomData = () => {
      if (shouldGenerateRandomData) {
        
        // Generuj nowe dane losowe co 3 sekundy tylko jeśli użytkownik nie jest zalogowany
        const randomData = generateRandomData();
        setPieChartData(randomData);
      }
    };

    // Rozpocznij generowanie danych losowych co 3 sekundy
    const intervalId = setInterval(updateRandomData, 3000);

    auth.onAuthStateChanged((user) => {
      if (user) {
        fetchData();

        setShouldGenerateRandomData(true);
        updateRandomData();

        if(data.length !== 0) {
          setShouldGenerateRandomData(false);
          document.querySelector(".overview")?.classList.remove("random-data");
          document.querySelector(".interface")?.classList.remove("interface-random-data");
        } else {
          document.querySelector(".overview")?.classList.add("random-data");
          document.querySelector(".interface")?.classList.add("interface-random-data");
        }
      } else {
        setShouldGenerateRandomData(true);
        // dodaj do .pie-chart klasę .random-data
        document.querySelector(".overview")?.classList.add("random-data");
        document.querySelector(".interface")?.classList.add("interface-random-data");

        // Jeśli użytkownik nie jest zalogowany, generuj dane losowe
        updateRandomData();
      }
    });

    // Zatrzymaj interval po odmontowaniu komponentu
    return () => {
      clearInterval(intervalId);
    };
  }, [data, shouldGenerateRandomData]);

  useEffect(() => {
    if (auth.currentUser) {
      if(data.length !== 0) {
        setShouldGenerateRandomData(false);
        document.querySelector(".overview")?.classList.remove("random-data");
        document.querySelector(".interface")?.classList.remove("interface-random-data");
      } else {
        document.querySelector(".overview")?.classList.add("random-data");
        document.querySelector(".interface")?.classList.add("interface-random-data");
      }
    } else {
      setShouldGenerateRandomData(true);
      // dodaj do .pie-chart klasę .random-data
      document.querySelector(".overview")?.classList.add("random-data");
      document.querySelector(".interface")?.classList.add("interface-random-data");
    }
  }, [data]);

  return (
    <div style={{ height: "400px", zIndex: 1 }} className="pie-chart">
      {pieChartData.length !== 0 &&
        <>
          <Text
            size="xl"
            weight={700}
            style={{ marginBottom: "1rem" }}
          >
            
          </Text>
          <Text
            size="md"
            weight={500}
            style={{ marginBottom: "1rem" }}
          >
            Podsumowanie wydatków
          </Text>
        </>
      }
      <ResponsivePie
        data={categories.filter((item) => item.value !== 0)}
        margin={{ top: 40, right: 100, bottom: 80, left: 100 }}
        tooltip={({ datum }) => (
          <div style={{ color: datum.color, padding: "3px 6px", borderRadius: "3px", backgroundColor: "#333333" }}>
            {datum.id}: {datum.value} zł
          </div>
        )}
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
            size: 4,
            padding: 1,
            stagger: true
          },
          {
            id: 'lines',
            type: 'patternLines',
            background: 'inherit',
            color: 'rgba(255, 255, 255, 0.3)',
            rotation: -45,
            lineWidth: 3,
            spacing: 10
          }
        ]}
        fill={[
          {
            match: {
              id: 'Jedzenie'
            },
            id: 'dots'
          },
          {
            match: {
              id: 'Rozrywka'
            },
            id: 'lines'
          },
          {
            match: {
              id: 'Transport'
            },
            id: 'dots'
          },
          {
            match: {
              id: 'Opłaty'
            },
            id: 'dots'
          },
          {
            match: {
              id: 'Inne'
            },
            id: 'lines'
          },
        ]}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 60,
            itemsSpacing: 5,
            itemWidth: 60,
            itemHeight: 18,
            itemTextColor: '#EEEEEE',
            itemDirection: "top-to-bottom",
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
