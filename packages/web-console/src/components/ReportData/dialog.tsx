import React, { useEffect, useState, CSSProperties, useMemo } from "react"
import { Button } from "@questdb/react-components"
import { Box } from "../Box"
import { Text } from "../Text"
import styled from "styled-components"
import { Table as TableIcon, Edit } from "@styled-icons/remix-line"
import { InfoCircle } from "@styled-icons/boxicons-regular"
import { Drawer } from "../Drawer"
import { PopperHover } from "../PopperHover"
import { Tooltip } from "../Tooltip"
import { Action, ReportResponse } from "./types"
import * as QuestDB from "../../utils/questdb"
import { useDispatch } from "react-redux"
import GridLoader from "react-spinners/GridLoader";

const StyledContentWrapper = styled(Drawer.ContentWrapper)`
  --columns: auto 120px; /* magic numbers to fit input, type dropdown and remove button nicely */
`

const Items = styled(Box).attrs({ gap: "0", flexDirection: "column" })`
  height: 100%;
`

const Inputs = styled(Box).attrs({ gap: "0", flexDirection: "column" })`
  width: 100%;
  height: 100%;
  overflow: auto;
`

const Controls = styled.div<{ action: Action }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: flex-start;
  width: 100%;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`

const Title = styled(Text)`
  display: flex;
  align-items: left;
  font-size: 1.8rem;
  font-weight: 600;
  margin-left: 10px;
  margin-bottom: 5px;
  width: 100%;
`
const Section = styled.div`
  display: flex;
  align-items: left;
  font-size: 1.7rem;
  font-weight: 500;
  margin-left: 20px;
  margin-bottom: 5px;
  width: 100%;
`
const SubSection = styled.div`
  display: flex;
  align-items: left;
  font-size: 1.7rem;
  font-weight: 500;
  margin-left: 35px;
  margin-bottom: 5px;
  width: 100%;
`

const Line = styled.hr`
  display: block;
  height: 1px;
  border: 0;
  border-top: 1px solid #ccc;
  margin: 5px;
  padding: 0;
`

type Props = {
  action: Action
  open: boolean
  trigger?: React.ReactNode
  tables?: QuestDB.Table[]
}

export const Dialog = ({
  action,
  open,
  tables,
  trigger,
}: Props) => {
  const [data, setData] = useState<ReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [intervalId, setIntervalId] = useState<number | undefined>();
  const [color, setColor] = useState("#ffffff");
  const [lastFocusedIndex, setLastFocusedIndex] = useState<number | undefined>()
  const dispatch = useDispatch()

  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };

  useEffect(() => {
    if (open) {
      setLastFocusedIndex(undefined)
    }
  }, [open])

  useEffect(() => {
    const loadReport = () => {
      const url = process.env.BE_URL;
      const user = process.env.BE_USER;
      const password = process.env.BE_PASS;
      let endpoint = `${url}/report`;
      const userPassword = `${user}:${password}`;
      setIsLoading(true);
      fetch(endpoint, {
          headers: {
            'Authorization': 'Basic ' + btoa(userPassword)
          }
      }).then(async (response) => {
        let resp = await response.json();
        setData(resp);
        setIsLoading(false);
      }).catch(error => {
        console.log(error);
        setIsLoading(false);
      });
    };

    if (open) {
      loadReport();
      let id = setInterval(loadReport, 1000 * 60 * 3);
      setIntervalId(id);
      console.log(`Setting interval: ${id}`)
    } else {
      clearInterval(intervalId);
      console.log(`Clearing interval: ${intervalId}`);
      setIntervalId(undefined);
    }
  }, [open]);

  const formattedDate = (timestamp:string) => {
      // Convert timestamp to Date object
      const date = new Date(timestamp);

      // Extract year, month, day, hours, and minutes
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      // Formatted result
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}.${seconds}`;
      return formattedDate;
  };
  if (isLoading || data.length === 0) {
    return (
      <Drawer
        mode={ "side" }
        open={open}
        trigger={ trigger } 
      >
        <StyledContentWrapper mode={ "side" }>
          <GridLoader color={color} size={15} aria-label="Loading Spinner" data-testid="loader" />
        </StyledContentWrapper>
      </Drawer>
    )
  }

  return (
    <Drawer
      mode={ "side" }
      open={open}
      trigger={ trigger } 
    >
      <StyledContentWrapper mode={ "side" }>
        <Container>
          <Title color="foreground">Dataset Status Report</Title>
          <Section color="foreground"><b>Database name</b>: { data ? data[0].database_name: 'N/A' }</Section>
          { data.map((item, index) => {
              return (
                <Container>
                  <Line />
                  <Section color="foreground"><b>Dataset</b>: { item.dataset_id }</Section>
                    <SubSection color="foreground">
                      <ul>
                        <li><b>Table name</b>&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp; <small>{ item.table_name }</small>
                        </li>
                        <li><b>Columns</b>&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp; <small>{ item.columns.join(', ') }</small>
                        </li>
                        <li><b>Number of data points</b>&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp; <small>{ item.num_datapoints.toLocaleString() }</small>
                        </li>
                        <li><b>Data from</b>&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp; <small>{ formattedDate(item.from) }</small>
                        </li>
                        <li><b>Data to</b>&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp; <small>{ formattedDate(item.to) }</small>
                        </li>
                        <li><b>Number of days</b>&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp; <small>{ item.num_days }</small>
                        </li>
                        <li><b>Number of months</b>&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp; <small>{ item.num_months }</small>
                        </li>
                        <li><b>Number of years</b>&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp; <small>{ item.num_years }</small>
                        </li>
                      </ul>
                    </SubSection>
                    <Line />
                </Container>
              )
            })
          }
        </Container>
      </StyledContentWrapper>
    </Drawer>
  )
}
